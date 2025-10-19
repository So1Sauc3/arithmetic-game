package main

import (
	"fmt"
	"log"
	"math/rand/v2"
	"sync"
	"sync/atomic"
	"time"
)

type ClientId = int

type Lobby struct {
	id         int
	register   chan *Client
	unregister chan *Client

	lobbyRead chan ClientLobbyMessage

	clientsMu sync.Mutex

	// contains all clients even those disconnected
	clients map[ClientId]*Client

	activeClientCount atomic.Int32

	hub *Hub

	done chan struct{}

	open bool
}

func newLobby(id int, hub *Hub) *Lobby {
	l := &Lobby{
		id:         id,
		register:   make(chan *Client),
		unregister: make(chan *Client),

		lobbyRead: make(chan ClientLobbyMessage),

		clients: make(map[ClientId]*Client),

		hub: hub,

		done: make(chan struct{}),
	}

	return l
}

func (l *Lobby) clientCount() int {
	return len(l.clients)
}

func (l *Lobby) run() {
	l.log("running")

	l.open = true

	startGameTimer := time.NewTimer(time.Minute)

	clientId := 0

	l.log("lobby started, waiting for players")

startGameLoop:
	for {
		select {
		case client := <-l.register:
			client.id = clientId
			clientId++
			l.registerClient(client)

		case client := <-l.unregister:
			l.unregisterClient(client)

		case <-startGameTimer.C:
			break startGameLoop

		case <-l.done:
			l.log("closing")
			l.hub.unregisterLobby(l)
			return
		}
	}

	startGameTimer.Stop()

	l.log("wait over, starting game")

	for _, client := range l.clients {
		client.difficulty = 1
		client.playing.Store(true)

		client.scoreMult = 1.0
		client.coinMult = 1.0

		question, expectedResult := GenerateQuestion(client.difficulty)

		client.expectedResult = expectedResult

		client.write <- NewQuestion{
			Difficulty: byte(client.difficulty),
			Question:   question,
		}
	}

	go l.eliminationHandler()

	for {
		select {
		case msg := <-l.lobbyRead:
			switch msg := msg.(type) {

			case ClientLobbySubmission:
				l.broadcast(OpponentScoreChanged{
					PlayerID: byte(msg.ClientID),
					NewScore: uint32(msg.NewScore),
				})

			case ClientLobbyStatusEffect:
				go l.handleLobbyStatusEffect(msg)

			}

		case c := <-l.unregister:
			l.unregisterClient(c)

		case <-l.done:
			l.log("closing")
			l.hub.unregisterLobby(l)
			return

		}
	}
}

func (l *Lobby) registerClient(c *Client) bool {
	l.clientsMu.Lock()
	defer l.clientsMu.Unlock()

	c.closed.Store(false)

	l.broadcast(NewRegisteredPlayer{
		Player{ID: byte(c.id), Name: c.name}})

	c.unregister = l.unregister
	c.read = l.lobbyRead

	go c.readPump()

	l.clients[c.id] = c

	players := []Player{}
	for _, client := range l.clients {
		if !client.closed.Load() {
			players = append(players,
				Player{ID: byte(client.id), Name: client.name})
		}
	}

	c.write <- LobbyGreeting{Players: players}

	l.activeClientCount.Add(1)
	full := l.activeClientCount.Load() == ClientsPerLobby

	return full
}

func (l *Lobby) unregisterClient(c *Client) {
	l.activeClientCount.Add(-1)

	l.broadcast(OpponentEliminated{byte(c.id)})

	if l.activeClientCount.Load() == 0 {
		l.log("all clients left")
		close(l.done)
	}
}

func (l *Lobby) broadcast(msg ServerMessage) {
	for _, c := range l.clients {
		if !c.closed.Load() {
			c.write <- msg
		}
	}
}

func (l *Lobby) eliminationHandler() {
	eliminationTimer := time.NewTimer(30 * time.Second)

	for range eliminationTimer.C {
		if l.activeClientCount.Load() == 0 {
			return
		}

		l.log("eliminating")

		const inf uint = ^uint(0)
		var c1, c2, c3 *Client
		min1, min2, min3 := inf, inf, inf

		for _, c := range l.clients {
			if c.closed.Load() {
				continue
			}

			s := c.score
			switch {
			case s < min1:
				c1, c2, c3 = c, c1, c2
				min1, min2, min3 = s, min1, min2
			case s < min2:
				c2, c3 = c, c2
				min2, min3 = s, min2
			case s < min3:
				c3 = c
				min3 = s
			}
		}

		if c1 != nil {
			c1.write <- Eliminated{byte(l.activeClientCount.Load())}
			l.activeClientCount.Add(-1)
			c1.closed.Store(true)
			l.broadcast(OpponentEliminated{byte(c1.id)})
		}

		if c2 != nil {
			c2.write <- Eliminated{byte(l.activeClientCount.Load())}
			l.activeClientCount.Add(-1)
			c2.closed.Store(true)
			l.broadcast(OpponentEliminated{byte(c2.id)})
		}

		if c3 != nil {
			c3.write <- Eliminated{byte(l.activeClientCount.Load())}
			l.activeClientCount.Add(-1)
			c3.closed.Store(true)
			l.broadcast(OpponentEliminated{byte(c3.id)})
		}

		if l.activeClientCount.Load() == 0 {
			return
		}
	}
}

func (l *Lobby) handleLobbyStatusEffect(cl ClientLobbyStatusEffect) {
	c := l.clients[cl.ClientID]

	switch cl.Powerup {
	case DoubleTapPowerup:

	case CoinLeakPowerup:
		c.coinMult = max(c.coinMult-0.1, 0.0)
		c.write <- MultipliersChanged{
			ScoreMult: c.scoreMult,
			CoinMult:  c.coinMult,
		}

	case HardModePowerup:
		newDifficulty := min(10, c.difficulty + 5)
		question, expectedResult := GenerateQuestion(newDifficulty)
		c.expectedResult = expectedResult
		c.write <- NewQuestion{
			Question: question,
			Difficulty: byte(newDifficulty),
		}
	}
}

// GenerateQuestion returns (question string, expectedResult)
func GenerateQuestion(difficulty uint) (string, int) {
	switch difficulty {
	case 1: // one-digit add & sub
		a, b := randInt(1, 9), randInt(1, 9)
		if rand.IntN(2) == 0 {
			return fmt.Sprintf("%d + %d = ", a, b), a + b
		}
		return fmt.Sprintf("%d - %d = ", a, b), a - b

	case 2: // two-digit add & sub
		a, b := randInt(10, 99), randInt(10, 99)
		if rand.IntN(2) == 0 {
			return fmt.Sprintf("%d + %d = ", a, b), a + b
		}
		return fmt.Sprintf("%d - %d = ", a, b), a - b

	case 3: // one-digit mult
		a, b := randInt(1, 9), randInt(1, 9)
		return fmt.Sprintf("%d × %d = ", a, b), a * b

	case 4: // one & two-digit mult
		a, b := randInt(1, 9), randInt(10, 99)
		if rand.IntN(2) == 0 {
			a, b = b, a
		}
		return fmt.Sprintf("%d × %d = ", a, b), a * b

	case 5: // one & two-digit div (integer only)
		b := randInt(1, 9)
		result := randInt(2, 9)
		a := b * result
		return fmt.Sprintf("%d ÷ %d = ", a, b), result

	case 6: // three numbers one-digit mult add
		a, b, c := randInt(1, 9), randInt(1, 9), randInt(1, 9)
		if rand.IntN(2) == 0 {
			return fmt.Sprintf("%d × %d + %d = ", a, b, c), a*b + c
		}
		return fmt.Sprintf("%d + %d × %d = ", a, b, c), a + b*c

	case 7: // three-digit add & sub
		a, b := randInt(100, 999), randInt(100, 999)
		if rand.IntN(2) == 0 {
			return fmt.Sprintf("%d + %d = ", a, b), a + b
		}
		return fmt.Sprintf("%d - %d = ", a, b), a - b

	case 8: // 3 one-digit mults
		a, b, c := randInt(1, 9), randInt(1, 9), randInt(1, 9)
		return fmt.Sprintf("%d × %d × %d = ", a, b, c), a * b * c

	case 9: // three and one-digit div (integer)
		b := randInt(2, 9)
		result := randInt(10, 99)
		a := b * result
		return fmt.Sprintf("%d ÷ %d = ", a, b), result

	case 10: // two-digit mult
		a, b := randInt(10, 99), randInt(10, 99)
		return fmt.Sprintf("%d × %d = ", a, b), a * b

	default:
		return "invalid difficulty", 0
	}
}

func (l *Lobby) log(format string, v ...any) {
	log.Printf("lobby %d: %s", l.id, fmt.Sprintf(format, v...))
}

func randInt(min, max int) int {
	return rand.IntN(max-min+1) + min
}

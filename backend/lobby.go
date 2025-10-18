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
	id       int
	register chan *Client

	lobbyRead chan ClientMessage

	clientsMu sync.Mutex

	// contains all clients even those disconnected
	clients map[ClientId]*Client

	activeClientCount atomic.Uint32

	hub *Hub

	done chan struct{}

	open bool
}

func newLobby(id int, hub *Hub) *Lobby {
	l := &Lobby{
		id:       id,
		register: make(chan *Client),

		lobbyRead: make(chan ClientMessage),

		clients: make(map[ClientId]*Client),

		hub: hub,
	}

	return l
}

func (l *Lobby) clientCount() int {
	return len(l.clients)
}

func (l *Lobby) run() {
	l.log("running")
	l.open = true

	startGameTimer := time.NewTimer(10 * time.Second)

	clientId := 0

	l.log("lobby started, waiting for players")
startGameLoop:
	for {
		select {
		case client := <-l.register:
			client.id = clientId
			clientId++
			l.registerClient(client)

		case <-startGameTimer.C:
			break startGameLoop
		}
	}

	l.log("wait over, starting game")

	for _, client := range l.clients {
		client.difficulty = 1
		client.playing.Store(true)

		question, expectedResult := GenerateQuestion(client.difficulty)

		client.expectedResult = expectedResult

		client.write <- NewQuestion{question}
	}

	for msg := range l.lobbyRead {
		switch msg.(type) {
		case PowerupPurchase:
			// TODO: implement powerups
		}
	}
}

func (l *Lobby) registerClient(c *Client) bool {
	l.clientsMu.Lock()
	defer l.clientsMu.Unlock()

	c.closed.Store(false)

	l.broadcast(NewRegisteredPlayer{
		Player{ID: byte(c.id), Name: c.name}})

	c.read = l.lobbyRead
	go c.readPump()

	players := []Player{}
	for _, client := range l.clients {
		players = append(players,
			Player{ID: byte(client.id), Name: client.name})
	}

	c.write <- LobbyGreeting{Players: players}

	l.clients[c.id] = c

	l.activeClientCount.Add(1)
	full := l.activeClientCount.Load() == ClientsPerLobby

	return full
}

func (l *Lobby) broadcast(msg ServerMessage) {
	for _, c := range l.clients {
		if !c.closed.Load() {
			c.write <- msg
		}
	}
}

func randInt(min, max int) int {
	return rand.IntN(max-min+1) + min
}

// GenerateQuestion returns (question string, expectedResult)
func GenerateQuestion(difficulty uint) (string, int) {
	switch difficulty {
	case 1: // one-digit add & sub
		a, b := randInt(1, 9), randInt(1, 9)
		if rand.IntN(2) == 0 {
			return fmt.Sprintf("%d + %d", a, b), a + b
		}
		return fmt.Sprintf("%d - %d", a, b), a - b

	case 2: // two-digit add & sub
		a, b := randInt(10, 99), randInt(10, 99)
		if rand.IntN(2) == 0 {
			return fmt.Sprintf("%d + %d", a, b), a + b
		}
		return fmt.Sprintf("%d - %d", a, b), a - b

	case 3: // one-digit mult
		a, b := randInt(1, 9), randInt(1, 9)
		return fmt.Sprintf("%d × %d", a, b), a * b

	case 4: // one & two-digit mult
		a, b := randInt(1, 9), randInt(10, 99)
		if rand.IntN(2) == 0 {
			a, b = b, a
		}
		return fmt.Sprintf("%d × %d", a, b), a * b

	case 5: // one & two-digit div (integer only)
		b := randInt(1, 9)
		result := randInt(2, 9)
		a := b * result
		return fmt.Sprintf("%d ÷ %d", a, b), result

	case 6: // three numbers one-digit mult add
		a, b, c := randInt(1, 9), randInt(1, 9), randInt(1, 9)
		if rand.IntN(2) == 0 {
			return fmt.Sprintf("%d × %d + %d", a, b, c), a*b + c
		}
		return fmt.Sprintf("%d + %d × %d", a, b, c), a + b*c

	case 7: // three-digit add & sub
		a, b := randInt(100, 999), randInt(100, 999)
		if rand.IntN(2) == 0 {
			return fmt.Sprintf("%d + %d", a, b), a + b
		}
		return fmt.Sprintf("%d - %d", a, b), a - b

	case 8: // 3 one-digit mults
		a, b, c := randInt(1, 9), randInt(1, 9), randInt(1, 9)
		return fmt.Sprintf("%d × %d × %d", a, b, c), a * b * c

	case 9: // three and one-digit div (integer)
		b := randInt(2, 9)
		result := randInt(10, 99)
		a := b * result
		return fmt.Sprintf("%d ÷ %d", a, b), result

	case 10: // two-digit mult
		a, b := randInt(10, 99), randInt(10, 99)
		return fmt.Sprintf("%d × %d", a, b), a * b

	default:
		return "invalid difficulty", 0
	}
}

func (l *Lobby) log(format string, v ...any) {
	log.Printf("lobby %d: %s", l.id, fmt.Sprintf(format, v...))
}

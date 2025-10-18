package main

import (
	"fmt"
	"log"
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

		case <-startGameTimer.C:
			break startGameLoop
		}
	}

	l.log("wait over, starting game")

	l.broadcast(StartGame{})

	for {
	}
}

func (l *Lobby) registerClient(c *Client) bool {
	l.clientsMu.Lock()
	defer l.clientsMu.Unlock()

	// TODO: broadcast new client joined

	c.lobbyRead = l.lobbyRead
	go c.readPump()

	players := []Player{}
	for _, client := range l.clients {
		players = append(players,
			Player{ID: byte(client.id), Name: client.name})
	}

	c.lobbyWrite <- LobbyGreeting{Players: players}

	l.activeClientCount.Add(1)
	full := l.activeClientCount.Load() == ClientsPerLobby

	return full
}

func (l *Lobby) broadcast(msg ServerMessage) {
	for _, c := range l.clients {
		if !c.closed.Load() {
			c.lobbyWrite <- msg
		}
	}
}

func (l *Lobby) log(format string, v ...any) {
	log.Printf("lobby %d: %s", l.id, fmt.Sprintf(format, v...))
}

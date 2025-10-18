package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	registerClientQueue chan *Client

	lobbiesMu sync.Mutex
	lobbies   []*Lobby
}

const ClientsPerLobby = 40

func NewHub() *Hub {
	h := &Hub{
		registerClientQueue: make(chan *Client, ClientsPerLobby*10),
		lobbies:             []*Lobby{},
	}

	return h
}

func (h *Hub) Run() {
	log.Println("Hub Started")

	for client := range h.registerClientQueue {
		log.Println("Client Recieved in Hub")

		r := h.findBestLobby()

		r.register <- client
	}
}

func (h *Hub) findBestLobby() *Lobby {
	h.lobbiesMu.Lock()
	defer h.lobbiesMu.Unlock()

	maxFill := -1
	var l *Lobby

	for _, lobby := range h.lobbies {
		if lobby.open && lobby.clientCount() > maxFill {
			l = lobby
			maxFill = lobby.clientCount()
		}
	}

	if l != nil {
		return l
	}

	log.Println("New room created")

	l = newLobby(len(h.lobbies), h)
	h.lobbies = append(h.lobbies, l)

	go l.run()

	return l
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (h *Hub) ServeWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusUpgradeRequired)
		log.Printf("upgrading error: %s\n", err)
		return
	}

	log.Println("New WS Connection")

	queryParams := r.URL.Query()

	name := queryParams.Get("name")

	c := &Client{
		name: name,
		conn: conn,

		write: make(chan ServerMessage),
	}

	hubGreetingMessage, _ := HubGreeting{}.MarshalBinary()
	err = conn.WriteMessage(websocket.BinaryMessage, hubGreetingMessage)

	if err != nil {
		c.log("error sending hub greeting: %+v", err)
		conn.Close()
		return
	}

	log.Println("Sent Hub Greeting")

	go c.writePump()

	h.registerClientQueue <- c
}

func (h *Hub) unregisterLobby(l *Lobby) {
	h.lobbiesMu.Lock()
	defer h.lobbiesMu.Unlock()

	for i, lobby := range h.lobbies {
		if lobby == l {
			h.lobbies[i] = h.lobbies[len(h.lobbies)-1]
			h.lobbies = h.lobbies[:len(h.lobbies)-1]
			return
		}
	}
}

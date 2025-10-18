package main

import (
	"sync"
)

type Hub struct {
	registerClientQueue chan *Client
	// unregisterRoomQueue chan *Lobby

	roomsMu sync.Mutex
	// rooms   []*Lobby
}

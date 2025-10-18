package main

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	id   int
	name string

	conn       *websocket.Conn
	connClosed bool

	hub *Hub

	// roomWrite chan PendingMessage
	roomRead  chan ClientMessage

	// room things
	// done   bool
	// closed bool

	closedMu sync.Mutex
}

// func (c *Client) readPump() {
// 	defer func() {
// 		if c.roomRead != nil {
// 			c.roomRead <- m.ClientQuitMessage{PlayerId: c.id}
// 		}
// 		c.close()
// 	}()
//
// 	for {
// 		var v json.RawMessage
//
// 		err := c.conn.ReadJSON(&v)
// 		if err != nil {
// 			c.connClosed = true
// 			if websocket.IsCloseError(err,
// 				websocket.CloseNormalClosure,
// 				websocket.CloseGoingAway,
// 				websocket.CloseAbnormalClosure,
// 			) || errors.Is(err, net.ErrClosed) {
// 				c.log("Tried to read, websocket closed")
// 				break
// 			}
// 			c.log("error reading connection json: %+v", err.Error())
// 			break
// 		}
//
// 		c.log("message received: %s", v)
//
// 		var w m.ClientMessageWrapper
//
// 		err = json.Unmarshal(v, &w)
// 		if err != nil {
// 			c.log("Error unmarshaling data 1: %v", err)
// 			continue
// 		}
//
// 		var cm m.ClientMessage
//
// 		switch w.Type {
// 		case m.ClientMessageTypeClientQuit:
// 			qm := m.ClientQuitMessage{}
// 			err = json.Unmarshal(w.Data, &qm)
// 			cm = qm
// 		case m.ClientMessageTypeSubmit:
// 			sm := m.SubmitMessage{}
// 			err = json.Unmarshal(w.Data, &sm)
// 			cm = sm
// 		case m.ClientMessageTypeSkipLobby:
// 			cm = m.SkipLobbyMessage{}
// 		case m.ClientMessageTypeSkipQuestion:
// 			cm = m.SkipQuestionMessage{}
// 		}
//
// 		if err != nil {
// 			c.log("Error unmarshaling data 2: %v", err)
// 			continue
// 		}
//
// 		c.roomRead <- cm
// 	}
// }

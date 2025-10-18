package main

import (
	"errors"
	"fmt"
	"log"
	"net"
	"sync/atomic"

	"github.com/gorilla/websocket"
)

type Client struct {
	id   int
	name string

	conn       *websocket.Conn
	connClosed bool

	hub *Hub

	// roomWrite chan PendingMessage
	lobbyRead  chan ClientMessage
	lobbyWrite chan ServerMessage

	closed atomic.Bool

	playing atomic.Bool

	expectedResult atomic.Int32
	score          atomic.Uint32
	coins          atomic.Uint32

	difficulty atomic.Uint32
	answered   atomic.Uint32
}

func (c *Client) readPump() {
	for {
		_, message, err := c.conn.ReadMessage()

		if err != nil {
			c.connClosed = true
			if websocket.IsCloseError(err,
				websocket.CloseNormalClosure,
				websocket.CloseGoingAway,
				websocket.CloseAbnormalClosure,
			) || errors.Is(err, net.ErrClosed) {
				c.log("Tried to read, websocket closed")
				break
			}
			c.log("error reading message from websocket: %+v", err.Error())
			break
		}

		clientMessage, err := ParseClientMessage(message)

		if err != nil {
			c.log("error parsing client message: %+v", err)
			break
		}

		switch clientMessage := clientMessage.(type) {
		case Register:
			c.lobbyRead <- clientMessage

		case Submission:
			if !c.playing.Load() {
				break
			}
			if c.expectedResult.Load() != clientMessage.Answer {
				break
			}

			// new question

		case PowerupPurchase:
			// check balance & reject if necessary
			c.lobbyRead <- clientMessage
		}
	}
}

func (c *Client) writePump() {
	for msg := range c.lobbyWrite {
		binaryMsg, err := msg.MarshalBinary()
		if err != nil {
			c.log("error marshaing binary: %+v", err)
			continue
		}
		err = c.conn.WriteMessage(websocket.BinaryMessage, binaryMsg)

		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				c.log("Tried to write, websocket closed")
				break
			}
			c.log("error writing server message to json %v", err)
			return
		}
	}

	if !c.connClosed {
		c.conn.WriteMessage(websocket.CloseMessage, []byte{})
	}
	c.log("writePump closed")
}

func (c *Client) log(format string, v ...any) {
	log.Printf("client %d: %s", c.id, fmt.Sprintf(format, v...))
}

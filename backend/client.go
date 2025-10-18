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
	read  chan ClientLobbyMessage
	write chan ServerMessage

	closed atomic.Bool

	playing atomic.Bool

	expectedResult int
	score          uint
	coins          uint

	scoreMult float32
	coinMult  float32

	difficulty uint
	answered   uint
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

		c.log("received client message: %d %T",
			clientMessage.Opcode(), clientMessage)

		switch clientMessage := clientMessage.(type) {

		case *Submission:
			if !c.playing.Load() {
				break
			}

			if c.expectedResult != int(clientMessage.Answer) {
				break
			}

			c.answered++
			if c.answered%5 == 0 {
				c.answered = 0
				if c.difficulty < 10 {
					c.difficulty++
				}
			}

			c.score += uint(100 * c.scoreMult)
			c.coins += uint(10 * c.coinMult)

			c.write <- CorrectSubmission{
				NewScore: uint32(c.score),
				NewCoins: uint32(c.coins),
			}

			c.read <- ClientLobbySubmission{
				ClientID: c.id,
				NewScore: c.score,
			}

			question, expectedResult := GenerateQuestion(c.difficulty)
			c.expectedResult = expectedResult

			c.write <- NewQuestion{
				Difficulty: byte(c.difficulty),
				Question:   question,
			}

		case *PowerupPurchase:
			if clientMessage.PowerupID >= byte(len(Powerups)) {
				c.log("received invalid powerup id: %d",
					clientMessage.PowerupID)
				break
			}

			powerup := Powerups[clientMessage.PowerupID]

			if powerup.cost > c.coins {
				break
			}

			c.coins -= powerup.cost

			switch clientMessage.PowerupID {

			case CoinMultPowerup:
				c.coinMult += 0.2
				c.write <- MultipliersChanged{
					ScoreMult: c.scoreMult,
					CoinMult:  c.coinMult,
				}

			case ScoreMultPowerup:
				c.scoreMult += 0.1
				c.write <- MultipliersChanged{
					ScoreMult: c.scoreMult,
					CoinMult:  c.coinMult,
				}

			case SkipQuestionPowerup:
				question, expectedResult := GenerateQuestion(c.difficulty)
				c.expectedResult = expectedResult
				c.write <- NewQuestion{
					Question:   question,
					Difficulty: byte(c.difficulty),
				}

			case EasyModePowerup:
				c.difficulty--
				c.answered = 0

				question, expectedResult := GenerateQuestion(c.difficulty)
				c.expectedResult = expectedResult
				c.write <- NewQuestion{
					Question:   question,
					Difficulty: byte(c.difficulty),
				}
			}

			c.write <- PurchaseConfirmed{
				NewCoins: uint32(c.coins),
			}
		}
	}
}

func (c *Client) writePump() {
	for msg := range c.write {
		binaryMsg, err := msg.MarshalBinary()
		if err != nil {
			c.log("error marshaing binary: %+v", err)
			continue
		}

		c.log("sending message: %d", msg.Opcode())

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

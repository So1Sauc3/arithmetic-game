package main

import (
	"encoding/binary"
	"errors"
)

// ServerMessage is implemented by all server->client messages.
type ServerMessage interface {
	Opcode() byte
	MarshalBinary() ([]byte, error)
}

// Opcodes
const (
	OpcodeHubGreeting              byte = 0
	OpcodeLobbyGreeting            byte = 1
	OpcodeNewRegisteredPlayer      byte = 2
	OpcodeCorrectSubmission        byte = 3
	OpcodeNewQuestion              byte = 4
	OpcodePurchaseConfirmed        byte = 5
	OpcodeStatusChanged            byte = 6
	OpcodeOtherPlayerStatusChanged byte = 7
	OpcodeEliminated               byte = 8
	OpcodeStartGame                byte = 9
)

// -------- Helper Types --------

type Player struct {
	ID   byte
	Name string
}

func (p Player) MarshalBinary() ([]byte, error) {
	nameLen := len(p.Name)
	if nameLen > 255 {
		return nil, errors.New("player name too long")
	}
	data := make([]byte, 2+nameLen)
	data[0] = p.ID
	data[1] = byte(nameLen)
	copy(data[2:], p.Name)
	return data, nil
}

// -------- Hub Greeting --------

type HubGreeting struct{}

func (HubGreeting) Opcode() byte { return OpcodeHubGreeting }

func (HubGreeting) MarshalBinary() ([]byte, error) {
	return []byte{OpcodeHubGreeting}, nil
}

// -------- Lobby Greeting --------

type LobbyGreeting struct {
	Players []Player
}

func (LobbyGreeting) Opcode() byte { return OpcodeLobbyGreeting }

func (lg LobbyGreeting) MarshalBinary() ([]byte, error) {
	if len(lg.Players) > 255 {
		return nil, errors.New("too many players")
	}
	buf := []byte{OpcodeLobbyGreeting, byte(len(lg.Players))}
	for _, p := range lg.Players {
		pb, err := p.MarshalBinary()
		if err != nil {
			return nil, err
		}
		buf = append(buf, pb...)
	}
	return buf, nil
}

// -------- New Registered Player --------

type NewRegisteredPlayer struct {
	Player Player
}

func (NewRegisteredPlayer) Opcode() byte { return OpcodeNewRegisteredPlayer }

func (n NewRegisteredPlayer) MarshalBinary() ([]byte, error) {
	pb, err := n.Player.MarshalBinary()
	if err != nil {
		return nil, err
	}
	return append([]byte{OpcodeNewRegisteredPlayer}, pb...), nil
}

// -------- Correct Submission --------

type CorrectSubmission struct {
	NewScore uint32
	NewCoins uint32
}

func (CorrectSubmission) Opcode() byte { return OpcodeCorrectSubmission }

func (c CorrectSubmission) MarshalBinary() ([]byte, error) {
	data := make([]byte, 1+8)
	data[0] = OpcodeCorrectSubmission
	binary.BigEndian.PutUint32(data[1:], c.NewScore)
	binary.BigEndian.PutUint32(data[5:], c.NewCoins)
	return data, nil
}

// -------- New Question --------

type NewQuestion struct {
	Difficulty byte
	Question   string
}

func (NewQuestion) Opcode() byte { return OpcodeNewQuestion }

func (nq NewQuestion) MarshalBinary() ([]byte, error) {
	qLen := len(nq.Question)
	if qLen > 65535 {
		return nil, errors.New("question too long")
	}
	data := make([]byte, 4+qLen)
	data[0] = OpcodeNewQuestion
	data[1] = nq.Difficulty
	binary.BigEndian.PutUint16(data[2:], uint16(qLen))
	copy(data[4:], nq.Question)
	return data, nil
}

// -------- Purchase Confirmed --------

type PurchaseConfirmed struct {
	NewCoins uint32
}

func (PurchaseConfirmed) Opcode() byte { return OpcodePurchaseConfirmed }

func (p PurchaseConfirmed) MarshalBinary() ([]byte, error) {
	data := make([]byte, 1+4)
	data[0] = OpcodePurchaseConfirmed
	binary.BigEndian.PutUint32(data[1:], p.NewCoins)
	return data, nil
}

// -------- Status Changed --------

type StatusChanged struct {
	StatusEffectIDs []uint16
}

func (StatusChanged) Opcode() byte { return OpcodeStatusChanged }

func (s StatusChanged) MarshalBinary() ([]byte, error) {
	count := len(s.StatusEffectIDs)
	if count > 65535 {
		return nil, errors.New("too many status effects")
	}
	data := make([]byte, 1+2+2*count)
	data[0] = OpcodeStatusChanged
	binary.BigEndian.PutUint16(data[1:], uint16(count))
	for i, id := range s.StatusEffectIDs {
		binary.BigEndian.PutUint16(data[3+i*2:], id)
	}
	return data, nil
}

// -------- Other Player Status Changed --------

type OtherPlayerStatusChanged struct {
	PlayerID        byte
	StatusEffectIDs []uint16
}

func (OtherPlayerStatusChanged) Opcode() byte { return OpcodeOtherPlayerStatusChanged }

func (o OtherPlayerStatusChanged) MarshalBinary() ([]byte, error) {
	count := len(o.StatusEffectIDs)
	if count > 65535 {
		return nil, errors.New("too many status effects")
	}
	data := make([]byte, 1+1+2+2*count)
	data[0] = OpcodeOtherPlayerStatusChanged
	data[1] = o.PlayerID
	binary.BigEndian.PutUint16(data[2:], uint16(count))
	for i, id := range o.StatusEffectIDs {
		binary.BigEndian.PutUint16(data[4+i*2:], id)
	}
	return data, nil
}

// -------- Eliminated --------

type Eliminated struct {
	Place byte
}

func (Eliminated) Opcode() byte { return OpcodeEliminated }

func (e Eliminated) MarshalBinary() ([]byte, error) {
	return []byte{OpcodeEliminated, e.Place}, nil
}

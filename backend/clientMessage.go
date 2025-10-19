package main

import (
	"encoding/binary"
	"errors"
	"fmt"
)

// ClientMessage is implemented by all client->server messages.
type ClientMessage interface {
	Opcode() byte
	UnmarshalBinary([]byte) error
}

// Opcodes
const (
	OpcodeRegister byte = iota
	OpcodeSubmission
	OpcodePowerup
	OpcodeSkipWait
)

// -------- Register --------

type Register struct {
	Name string
}

func (*Register) Opcode() byte { return OpcodeRegister }

func (r *Register) UnmarshalBinary(data []byte) error {
	if len(data) < 2 {
		return errors.New("register message too short")
	}
	if data[0] != OpcodeRegister {
		return fmt.Errorf("invalid opcode %d for Register", data[0])
	}
	nameLen := int(data[1])
	if len(data) < 2+nameLen {
		return errors.New("register message truncated name")
	}
	r.Name = string(data[2 : 2+nameLen])
	return nil
}

// -------- Submission --------

type Submission struct {
	Answer int32
}

func (*Submission) Opcode() byte { return OpcodeSubmission }

func (s *Submission) UnmarshalBinary(data []byte) error {
	if len(data) < 5 {
		return errors.New("submission message too short")
	}
	if data[0] != OpcodeSubmission {
		return fmt.Errorf("invalid opcode %d for Submission", data[0])
	}
	s.Answer = int32(binary.BigEndian.Uint32(data[1:5]))
	return nil
}

// -------- Powerup Purchase --------

type PowerupPurchase struct {
	PowerupID      byte
	AffectedPlayer byte
}

func (*PowerupPurchase) Opcode() byte { return OpcodePowerup }

func (p *PowerupPurchase) UnmarshalBinary(data []byte) error {
	if len(data) < 3 {
		return errors.New("powerup purchase message too short")
	}
	if data[0] != OpcodePowerup {
		return fmt.Errorf("invalid opcode %d for PowerupPurchase", data[0])
	}
	p.PowerupID = data[1]
	p.AffectedPlayer = data[2]
	return nil
}

// -------- Skip Wait --------

type SkipWait struct {
}

func (*SkipWait) Opcode() byte { return OpcodeSkipWait }
func (s *SkipWait) UnmarshalBinary(data []byte) error {
	if len(data) < 1 {
		return errors.New("skip wait message too short")
	}
	if data[0] != OpcodeSkipWait {
		return fmt.Errorf("invalid opcode %d for SkipWait", data[0])
	}
	return nil
}

// -------- Dispatcher --------

// ParseClientMessage parses the binary data into the correct ClientMessage.
func ParseClientMessage(data []byte) (ClientMessage, error) {
	if len(data) == 0 {
		return nil, errors.New("empty message")
	}
	var msg ClientMessage
	switch data[0] {
	case OpcodeRegister:
		msg = &Register{}
	case OpcodeSubmission:
		msg = &Submission{}
	case OpcodePowerup:
		msg = &PowerupPurchase{}
	case OpcodeSkipWait:
		msg = &SkipWait{}
	default:
		return nil, fmt.Errorf("unknown opcode %d", data[0])
	}
	return msg, msg.UnmarshalBinary(data)
}

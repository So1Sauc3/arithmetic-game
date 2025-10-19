package main

type ClientLobbyMessage interface {
	clientLobbyMessage()
}

type ClientLobbySubmission struct {
	ClientID ClientId
	NewScore uint
}

func (ClientLobbySubmission) clientLobbyMessage() {}

type ClientLobbyStatusEffect struct {
	ClientID ClientId
	Powerup  byte
}

func (ClientLobbyStatusEffect) clientLobbyMessage() {}

type ClientLobbySkipWait struct {
}

func (ClientLobbySkipWait) clientLobbyMessage() {}

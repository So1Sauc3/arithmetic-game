package main

type ClientLobbyMessage interface {
	clientLobbyMessage()
}

type ClientLobbySubmission struct {
	ClientID ClientId
	NewScore int
}

func (ClientLobbySubmission) clientLobbyMessage()

type ClientLobbyStatusEffect struct {
	ClientID ClientId
	// status effect
}

func (ClientLobbyStatusEffect) clientLobbyMessage()

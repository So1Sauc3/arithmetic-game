package main

const (
	CoinMultPowerup byte = iota
	ScoreMultPowerup
	SkipQuestionPowerup
	EasyModePowerup
)

type Powerup struct {
	cost uint
}

var Powerups = []Powerup{
	CoinMultPowerup:     {cost: 20},
	ScoreMultPowerup:    {cost: 30},
	SkipQuestionPowerup: {cost: 50},
	EasyModePowerup:     {cost: 200},
}

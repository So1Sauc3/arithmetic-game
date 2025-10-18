package main

const (
	CoinMultPowerup byte = iota
	ScoreMultPowerup
	SkipQuestionPowerup
	EasyModePowerup
	DoubleTapPowerup
	CoinLeakPowerup
	HardModePowerup
)

type Powerup struct {
	cost uint
}

var Powerups = []Powerup{
	CoinMultPowerup:     {cost: 20},
	ScoreMultPowerup:    {cost: 30},
	SkipQuestionPowerup: {cost: 50},
	EasyModePowerup:     {cost: 200},
	DoubleTapPowerup:    {cost: 200},
	CoinLeakPowerup:     {cost: 300},
	HardModePowerup:     {cost: 500},
}

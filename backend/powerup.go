package main

const (
	CoinMultPowerup uint16 = iota
	ScoreMultPowerup
	SkipQuestionPowerup
	EasyModePowerup
)

type Powerup struct {
	cost int
}

var Powerups = []Powerup{
	CoinMultPowerup:     {cost: 20},
	ScoreMultPowerup:    {cost: 30},
	SkipQuestionPowerup: {cost: 50},
	EasyModePowerup:     {cost: 200},
}

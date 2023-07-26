package main

import (
	"crm"
	"crm/internal/config"
	"crm/internal/repository"
	"crm/internal/services"
	"crm/internal/transport"
	"crm/pkg/database"
	"crm/pkg/logger"
	"github.com/rs/zerolog/log"
	"strconv"
	"time"
)

// migrate create -ext sql -dir ./schema -seq init - new migrate
// migrate -path ./schema -database 'postgres://nik:1325@localhost:5437/nik?sslmode=disable' up
// export LIBRARY_PATH=/opt/homebrew/Cellar/imagemagick/7.1.1-12/lib

type EndTimeCalculator struct {
	Layout string

	WorkerStringStartTime string
	WorkerFullStartTime   time.Time
	WorkerCalcStartTime   time.Time
	TheorEndTime          time.Time

	MachineStringStartTime string
	MachineStartTime       time.Time
	MachineStringEndTime   string
	MachineEndTime         time.Time
	MachineWorkingMinutes  float64

	RestTime time.Duration

	FullQuantity     float64
	DayQuantity      float64
	QuantityAtMinute float64
	Issued           float64

	NeededTime float64
}

func (c *EndTimeCalculator) createCalcTime(stringTime string) time.Time {
	timeH, _ := strconv.Atoi(stringTime[:2])
	timeM, _ := strconv.Atoi(stringTime[3:])

	return time.Date(2000, 10, 23, timeH, timeM, 0, 0, time.Local)
}

func (c *EndTimeCalculator) createFullTime(stringTime string) time.Time {
	res, _ := time.Parse("2006-01-02 15:04", stringTime)
	return res
}

func (c *EndTimeCalculator) findWorkingMinutes(endTime time.Time, start time.Time) float64 {
	return float64((endTime.Unix()-start.Unix())/60) * 10 / 12
}

func (c *EndTimeCalculator) setQuantityAtMinute() {
	c.QuantityAtMinute = c.DayQuantity / c.MachineWorkingMinutes
}

func (c *EndTimeCalculator) findNeededTime() float64 {
	c.NeededTime = (c.FullQuantity / c.DayQuantity) * c.MachineWorkingMinutes
	return c.NeededTime
}

func init() {
	logger.CustomizeLogger()
}

func main() {
	cfg := config.GetConfig()

	pgDb, err := database.NewPostgresDB(cfg.CrmDB)
	if err != nil {
		log.Fatal().Caller().Err(err).Msg("error connecting to database")
	}

	repos := repository.NewRepository(pgDb)
	service := services.NewService(repos)
	mainHandler := transport.NewMainHandler(service)

	srv := crm.NewServer(cfg.AppPort, mainHandler.InitAllRoutes())
	if err := srv.Run(); err != nil {
		log.Fatal().Err(err).Msg("error starting server")
	}
}

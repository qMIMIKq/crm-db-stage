package main

import (
	"crm"
	"crm/internal/config"
	"crm/internal/repository"
	"crm/internal/services"
	"crm/internal/transport"
	"crm/pkg/database"
	"crm/pkg/hasher"
	"crm/pkg/logger"
	"github.com/rs/zerolog/log"
)

// migrate create -ext sql -dir ./schema -seq init - new migrate
// migrate -path ./schema -database 'postgres://nik:1325@localhost:5437/nik?sslmode=disable' up

func init() {
	logger.CustomizeLogger()
}

func main() {
	cfg := config.GetConfig()

	pass := hasher.GeneratePasswordHash("1111", "asda312das")
	log.Info().Msg(pass)

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

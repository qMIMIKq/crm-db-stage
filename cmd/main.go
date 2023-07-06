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
)

// migrate create -ext sql -dir ./schema -seq init - new migrate
// migrate -path ./schema -database 'postgres://nik:1325@localhost:5437/nik?sslmode=disable' up
// export LIBRARY_PATH=/opt/homebrew/Cellar/imagemagick/7.1.1-12/lib

func init() {
	logger.CustomizeLogger()
}

func main() {
	cfg := config.GetConfig()

	pgDb, err := database.NewPostgresDB(cfg.CrmDB)
	if err != nil {
		log.Fatal().Caller().Err(err).Msg("error connecting to database")
	}
	//
	//imagick.Initialize()
	//defer imagick.Terminate()
	//mw := imagick.NewMagickWand()
	//defer mw.Destroy()

	repos := repository.NewRepository(pgDb)
	service := services.NewService(repos)
	mainHandler := transport.NewMainHandler(service)

	srv := crm.NewServer(cfg.AppPort, mainHandler.InitAllRoutes())
	if err := srv.Run(); err != nil {
		log.Fatal().Err(err).Msg("error starting server")
	}
}

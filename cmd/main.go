package main

import (
	"crm"
	"crm/internal/config"
	"crm/internal/repository"
	"crm/internal/services"
	"crm/internal/transport"
	"crm/pkg/database"
	"crm/pkg/logger"
	"fmt"
	"github.com/rs/zerolog/log"
	"os"
	"os/exec"
)

// migrate create -ext sql -dir ./schema -seq init - new migrate
// migrate -path ./schema -database 'postgres://nik:1325@localhost:5437/nik?sslmode=disable' up
// export LIBRARY_PATH=/opt/homebrew/Cellar/imagemagick/7.1.1-12/lib

func init() {
	logger.CustomizeLogger()
}

func buildFrontend(addr string) {
	log.Info().Interface("config", addr).Msg("app address for js")
	file, err := os.Create("appAddr.js")
	defer file.Close()
	if _, err := file.Write([]byte(fmt.Sprintf("export const appAddr = '%s'", addr))); err != nil {
		log.Fatal().Err(err).Msg("error create server addr for js")
	}

	log.Info().Msg("building web interface...")
	cmd := exec.Command("webpack", "--node-env=production")
	cmd.Stdout = os.Stdout
	cmd.Stdin = os.Stdin
	cmd.Stderr = os.Stderr

	if err = cmd.Run(); err != nil {
		log.Fatal().Err(err).Msg("error build web interface")
	}
}

func main() {
	cfg := config.GetConfig()

	buildFrontend(cfg.AppAddressJs)

	pgDb, err := database.NewPostgresDB(cfg.CrmDB)
	if err != nil {
		log.Fatal().Caller().Err(err).Msg("error connecting to database")
	}
	repos := repository.NewRepository(pgDb)
	if err := repos.Init.InitDB(); err != nil {
		log.Fatal().Err(err).Msg("error init tables")
	}
	log.Info().Caller().Msg("init services...")
	service := services.NewService(repos)
	log.Info().Caller().Msg("init transport...")
	mainHandler := transport.NewMainHandler(service)

	log.Info().Caller().Msg("starting app...")
	if err := crm.NewServer(cfg.AppPort, mainHandler.InitAllRoutes()).Run(); err != nil {
		log.Fatal().Err(err).Msg("error starting server")
	}
}

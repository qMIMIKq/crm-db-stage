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
	"gopkg.in/gographics/imagick.v3/imagick"
	"strconv"
)

// migrate create -ext sql -dir ./schema -seq init - new migrate
// migrate -path ./schema -database 'postgres://nik:1325@localhost:5437/nik?sslmode=disable' up

func init() {
	logger.CustomizeLogger()
}

func main() {
	cfg := config.GetConfig()

	//arrStr := strings.Split("12345678", "")
	str := "12345678"
	res := ""
	for _, sNum := range str {
		num, _ := strconv.Atoi(string(sNum))

		if num > 5 {
			res = "0" + res
		} else {
			res = "1" + res
		}
	}

	log.Info().Caller().Msgf("Res is %s", res)

	pgDb, err := database.NewPostgresDB(cfg.CrmDB)
	if err != nil {
		log.Fatal().Caller().Err(err).Msg("error connecting to database")
	}

	imagick.Initialize()
	defer imagick.Terminate()
	mw := imagick.NewMagickWand()
	defer mw.Destroy()

	repos := repository.NewRepository(pgDb, mw)
	service := services.NewService(repos)
	mainHandler := transport.NewMainHandler(service)

	srv := crm.NewServer(cfg.AppPort, mainHandler.InitAllRoutes())
	if err := srv.Run(); err != nil {
		log.Fatal().Err(err).Msg("error starting server")
	}
}

package crm

import (
	"context"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"net/http"
	"time"
)

type server struct {
	httpServer *http.Server
	log        *zerolog.Logger
}

func (s *server) Run() error {
	log.Info().Caller().Msgf("starting server on port: %s", s.httpServer.Addr)
	return s.httpServer.ListenAndServe()
}

func (s *server) Shutdown(ctx context.Context) error {
	log.Warn().Caller().Msgf("shutdown server")
	return s.httpServer.Shutdown(ctx)
}

func NewServer(port string, handler http.Handler) *server {
	return &server{
		httpServer: &http.Server{
			Addr:           ":" + port,
			Handler:        handler,
			MaxHeaderBytes: 1 << 20,
			ReadTimeout:    10 * time.Second,
			WriteTimeout:   10 * time.Second,
		},
	}
}

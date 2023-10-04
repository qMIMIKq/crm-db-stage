package crm

import (
	"context"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"net/http"
	"time"
)

type Server struct {
	httpServer *http.Server
	log        *zerolog.Logger
}

func (s *Server) Run() error {
	log.Info().Caller().Msgf("starting server on port: %s", s.httpServer.Addr)
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	log.Warn().Caller().Msgf("shutdown server")
	return s.httpServer.Shutdown(ctx)
}

func NewServer(port string, handler http.Handler) *Server {
	return &Server{
		httpServer: &http.Server{
			Addr:           ":" + port,
			Handler:        handler,
			MaxHeaderBytes: 1000000000,
			ReadTimeout:    30 * time.Second,
			WriteTimeout:   30 * time.Second,
		},
	}
}

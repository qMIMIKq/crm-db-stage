package transport

import (
	"crm/internal/services"
	"crm/internal/transport/handler"
	"crm/internal/transport/view_handler"
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
)

type mainHandler struct {
	handler     *handler.Handler
	viewHandler *view_handler.ViewHandler
}

func (h *mainHandler) InitAllRoutes() *gin.Engine {
	router := gin.New()

	gin.SetMode("release")

	router.Use(gin.Recovery())
	router.Use(ginSession.New())
	//router.Use(middleware.LoggerMiddleware)

	h.handler.InitRoutes(router)
	h.viewHandler.InitViewRoutes(router)

	return router
}

func NewMainHandler(services *services.Services) *mainHandler {
	return &mainHandler{
		handler:     handler.NewHandler(services),
		viewHandler: view_handler.NewViewHandler(services),
	}
}

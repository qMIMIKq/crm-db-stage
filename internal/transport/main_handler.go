package transport

import (
	"crm/internal/services"
	"crm/internal/transport/handler"
	"crm/internal/transport/view_handler"
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
)

type MainHandler struct {
	handler     *handler.Handler
	viewHandler *view_handler.ViewHandler
}

func (h *MainHandler) InitAllRoutes() *gin.Engine {
	router := gin.New()

	gin.SetMode("release")

	router.Use(gin.Recovery())
	router.Use(ginSession.New())
	//router.Use(middleware.LoggerMiddleware)

	h.handler.InitRoutes(router)
	h.viewHandler.InitViewRoutes(router)

	return router
}

func NewMainHandler(services *services.Services) *MainHandler {
	return &MainHandler{
		handler:     handler.NewHandler(services),
		viewHandler: view_handler.NewViewHandler(services),
	}
}

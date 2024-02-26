package view_handler

import (
	"crm/internal/services"
	"crm/internal/transport/middleware"
	"github.com/gin-gonic/gin"
)

type ViewHandler struct {
	services *services.Services
}

func (h *ViewHandler) InitViewRoutes(router *gin.Engine) {
	router.Static("/static", "./web/dist/static")
	router.Static("/assets", "./assets")
	router.LoadHTMLGlob("./web/dist/templates/**/*.html")

	router.GET("/login", h.loginView)

	main := router.Group("/main", middleware.CheckAuth)
	{
		main.GET("/table", h.indexView)
		main.GET("/report", h.reportView)
		main.GET("/plan", h.planningView)
		main.GET("/time-report", h.timeReportView)
	}
}

func NewViewHandler(services *services.Services) *ViewHandler {
	return &ViewHandler{
		services: services,
	}
}

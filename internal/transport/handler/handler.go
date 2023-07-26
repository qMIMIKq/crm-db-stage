package handler

import (
	"crm/internal/services"
	"github.com/gin-gonic/gin"
	"net/http"
)

type Handler struct {
	services   *services.Services
	lastChange string
}

func (h *Handler) InitRoutes(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/sign-in", h.signIn)
	}

	api := router.Group("/api")
	{
		plots := api.Group("/plots")
		{
			plots.GET("/get-all", h.getPlots)
		}

		filters := api.Group("/filters")
		{
			filters.GET("/get-all", h.getFilters)
		}

		users := api.Group("/users")
		{
			users.GET("/get-operators", h.getOperators)
			users.GET("/get-all-operators", h.getAllOperators)
			users.GET("/get-users", h.getUsers)
		}

		files := api.Group("/files")
		{
			files.POST("/save-files", h.saveFiles)
			files.POST("/remove-file/:oder-id/:name", h.removeFile)
		}

		orders := api.Group("/orders")
		{
			orders.GET("/get-all", h.getOrders)
			orders.GET("/get-old", h.getOldOrders)
			orders.POST("/delete/:id", h.deleteOrder)
			orders.POST("/add", h.addOrders)
			orders.PUT("/update", h.updateOrders)
		}

		routes := api.Group("/routes")
		{
			routes.POST("/delete/:id", h.deleteRoute)
		}

		time := api.Group("/time")
		{
			time.POST("/theoretic", h.theoreticTime)
			time.POST("/dynamic", h.dynamicTime)
		}
	}
}

func (h *Handler) getAllOperators(c *gin.Context) {
	users, err := h.services.Users.GetOperators()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"data": users,
	})
}

func NewHandler(services *services.Services) *Handler {
	return &Handler{
		services: services,
	}
}

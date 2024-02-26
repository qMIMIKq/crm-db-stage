package handler

import (
	"crm/internal/services"
	"github.com/gin-gonic/gin"
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

		groups := api.Group("/groups")
		{
			groups.GET("/get-all", h.getGroups)
			groups.POST("/get-group", h.getGroup)
			groups.PUT("/edit", h.editGroup)
		}

		plots := api.Group("/plots")
		{
			plots.GET("/get-all", h.getPlots)
			plots.POST("/get-plot", h.getPlot)
			plots.POST("/add", h.addPlot)
			plots.PUT("/edit", h.editPlot)
			plots.POST("/delete/:plot-id", h.deletePlot)
		}

		filters := api.Group("/filters")
		{
			filters.GET("/get-all", h.getFilters)
			filters.POST("get-filter", h.getFilter)
			filters.GET("/get-all-hidden", h.getByHiddenFilters)
			filters.POST("/add", h.addFilter)
			filters.PUT("/edit", h.editFilter)
			filters.POST("/delete/:filter-id", h.deleteFilter)
			filters.PUT("/edit-position", h.editFilterPosition)
		}

		users := api.Group("/users")
		{
			users.GET("/get-operators", h.getOperators)
			users.GET("/get-managers", h.getManagers)
			users.GET("/get-all-operators", h.getAllOperators)
			users.GET("/get-users", h.getUsers)
			users.GET("/get-all", h.getAllUsers)
			users.POST("/get-user", h.getUserByID)
			users.POST("/add", h.addUser)
			users.POST("/delete/:user-id", h.deleteUser)
			users.PUT("/edit", h.editUser)
		}

		files := api.Group("/files")
		{
			files.POST("/save-files", h.saveFiles)
			files.POST("/remove-file/:oder-id/:name", h.removeFile)
		}

		orders := api.Group("/orders")
		{
			orders.POST("/get-all", h.getOrders)
			orders.POST("/delete/:id", h.deleteOrder)
			orders.POST("/add", h.addOrders)
			orders.PUT("/update", h.updateOrders)
		}

		routes := api.Group("/routes")
		{
			routes.POST("/delete/:id", h.deleteRoute)
			routes.POST("/get-route", h.getRouteByID)
			routes.POST("/update-route", h.updateRoute)
		}

		time := api.Group("/time")
		{
			time.POST("/theoretic", h.theoreticTime)
			time.POST("/dynamic", h.dynamicTime)
		}

		timeReports := api.Group("/time-reports")
		{
			timeReports.POST("/get-all", h.getTimeReports)
			//time.POST("/dynamic", h.dynamicTime)
		}

		report := api.Group("/reports")
		{
			report.POST("/get-all", h.getReports)
			report.POST("/update", h.updateReports)
		}

		plans := api.Group("/plans")
		{
			plans.POST("/get-busy", h.getBusyPlans)
			plans.POST("/update", h.updatePlan)
			plans.POST("/shift", h.shiftPlan)
			plans.POST("/shift-auto", h.autoShiftPlan)
		}

		planning := api.Group("/planning")
		{
			planning.POST("/get-all", h.getAllPlanning)
		}
	}
}

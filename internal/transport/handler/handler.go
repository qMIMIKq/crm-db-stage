package handler

import (
	"bytes"
	"crm/internal/repository"
	"crm/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

type Handler struct {
	services *services.Services
}

func (h *Handler) InitRoutes(router *gin.Engine) {
	router.GET("/test", func(c *gin.Context) {
		client := &http.Client{}
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)
		fw, err := writer.CreateFormFile("file", "Уголок_YpiaZs8.DXF")
		if err != nil {
			log.Fatal().Caller().Err(err).Msg("error")
		}

		file, err := os.Open(repository.DataPath + "Уголок_YpiaZs8.DXF")
		if err != nil {
			log.Fatal().Caller().Err(err).Msg("error")
		}
		_, err = io.Copy(fw, file)
		if err != nil {
			log.Fatal().Caller().Err(err).Msg("error")
		}
		writer.Close()

		req, err := http.NewRequest(http.MethodPost, "http://127.0.0.1:5000/dxf-convert", bytes.NewReader(body.Bytes()))
		if err != nil {
			log.Fatal().Caller().Err(err).Msg("error")
		}
		req.Header.Set("Content-Type", writer.FormDataContentType())
		rsp, err := client.Do(req)
		if rsp.StatusCode != http.StatusOK {
			log.Fatal().Caller().Err(err).Msg("error")
		}
	})

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
			orders.POST("/add", h.addOrders)
			orders.PUT("/update", h.updateOrders)
		}

		routes := api.Group("/routes")
		{
			routes.POST("/delete/:id", h.deleteRoute)
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

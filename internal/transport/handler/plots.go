package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) getPlots(c *gin.Context) {
	plots, err := h.services.Plots.GetPlots()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, http.StatusOK, plots)
}

func (h *Handler) getPlot(c *gin.Context) {
	data := map[string]string{}
	if err := c.Bind(&data); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	plot, err := h.services.Plots.GetPlotByID(data["id"])
	if err != nil {
		c.Redirect(http.StatusFound, "/users/view")
		return
	}

	newDataResponse(c, 200, plot)
}

func (h *Handler) addPlot(c *gin.Context) {
	var plot domain.Plot
	if err := c.Bind(&plot); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
	}

	id, err := h.services.Plots.CreatePlot(plot)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"id": id,
	})
}

func (h *Handler) deletePlot(c *gin.Context) {
	plotID := c.Param("plot-id")

	if err := h.services.Plots.DeletePlot(plotID); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newOkResponse(c, http.StatusOK)
}

func (h *Handler) editPlot(c *gin.Context) {
	var plot domain.Plot
	if err := c.Bind(&plot); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	err := h.services.Plots.EditPlot(plot)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"status": "ok",
	})
}

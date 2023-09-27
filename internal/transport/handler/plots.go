package handler

import (
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

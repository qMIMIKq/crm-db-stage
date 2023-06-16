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

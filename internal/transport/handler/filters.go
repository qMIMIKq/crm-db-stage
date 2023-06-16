package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) getFilters(c *gin.Context) {
	filters, err := h.services.Filters.GetFilters()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, http.StatusOK, filters)
}

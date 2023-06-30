package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) deleteRoute(c *gin.Context) {
	routeID := c.Param("id")

	if err := h.services.DeleteRoute(routeID); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newOkResponse(c, http.StatusOK)
}

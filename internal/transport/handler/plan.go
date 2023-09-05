package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) getBusyPlans(c *gin.Context) {
	var plot map[string]string
	if err := c.Bind(&plot); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	res, err := h.services.Plans.GetBusy(plot["plot"], plot["route_id"])
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, http.StatusOK, res)
}

package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) getReports(c *gin.Context) {
	var reportParams domain.ReportTime
	if err := c.BindJSON(&reportParams); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	res, err := h.services.Reports.GetAll(reportParams)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, http.StatusOK, res)
}

func (h *Handler) updateReports(c *gin.Context) {
	var route domain.Route
	if err := c.BindJSON(&route); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	if err := h.services.Reports.UpdateReports(route); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newOkResponse(c, http.StatusOK)
}

package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"net/http"
)

func (h *Handler) getReports(c *gin.Context) {
	var reportTime domain.ReportTime
	if err := c.BindJSON(&reportTime); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	log.Info().Interface("time", reportTime).Msg("report time")

	res, err := h.services.Reports.GetAll(reportTime.From, reportTime.To)
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

package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"net/http"
)

func (h *Handler) getTimeReports(c *gin.Context) {
	var reportTime *domain.ReportTime
	if err := c.BindJSON(&reportTime); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	log.Info().Msgf("get reports")
	res := h.services.TimeReports.GetTimeReports(reportTime)

	//log.Info().Interface("info is", timeInfo).Msg("Time info")
	newDataResponse(c, http.StatusOK, res)
}

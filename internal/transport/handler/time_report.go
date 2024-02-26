package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"net/http"
)

func (h *Handler) getTimeReports(c *gin.Context) {
	//var timeInfo domain.TimeInfo
	//if err := c.Bind(&timeInfo); err != nil {
	//	newErrorResponse(c, http.StatusBadRequest, err)
	//	return
	//}

	log.Info().Msgf("get reports")
	res := h.services.TimeReports.GetTimeReports()

	//log.Info().Interface("info is", timeInfo).Msg("Time info")
	newDataResponse(c, http.StatusOK, res)
}

package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"net/http"
)

func (h *Handler) theoreticTime(c *gin.Context) {
	var timeInfo domain.TimeInfo
	if err := c.Bind(&timeInfo); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	date, days, canDo := h.services.Time.CalcTheoreticTime(timeInfo)
	log.Info().Caller().Msgf("endTime: %v __ counter: %v", date, days)
	log.Info().Caller().Interface("can do", canDo).Msg("can do")

	//log.Info().Interface("info is", timeInfo).Msg("Time info")
	c.JSON(http.StatusOK, map[string]interface{}{
		"date":   date,
		"days":   days,
		"can_do": canDo,
	})
}

func (h *Handler) dynamicTime(c *gin.Context) {

}

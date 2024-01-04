package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"net/http"
)

func (h *Handler) getAllPlanning(c *gin.Context) {
	var planningRange domain.PlanningRange
	if err := c.Bind(&planningRange); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	log.Info().Caller().Interface("range is", planningRange).Msgf("planning range")
	planning, err := h.services.Planning.GetAllPlanning(&planningRange)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, http.StatusOK, planning)
}

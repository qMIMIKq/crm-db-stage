package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
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

func (h *Handler) updatePlan(c *gin.Context) {
	var planData *domain.PlanData
	if err := c.Bind(&planData); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	log.Info().Interface("plan data", planData).Msg("PLAN DATA")

	if err := h.services.UpdatePlan(planData); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newOkResponse(c, http.StatusOK)
}

package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"net/http"
	"strings"
)

func (h *Handler) addOrders(c *gin.Context) {
	var orders []*domain.Order

	if err := c.Bind(&orders); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	log.Info().Interface("data", orders).Msg("orders")

	err := h.services.Orders.AddOrders(orders)
	if err != nil {
		if !strings.Contains(err.Error(), " duplicate key value violates") {
			newErrorResponse(c, http.StatusInternalServerError, err)
			return
		}
	}

	newOkResponse(c, http.StatusCreated)
}

func (h *Handler) getOrders(c *gin.Context) {
	orders, err := h.services.GetOrders()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, http.StatusOK, orders)
}

func (h *Handler) updateOrders(c *gin.Context) {
	var orders []*domain.Order
	if err := c.Bind(&orders); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	err := h.services.Orders.UpdateOrders(orders)
	if err != nil {
		if !strings.Contains(err.Error(), "duplicate key value violates") {
			newErrorResponse(c, http.StatusInternalServerError, err)
			return
		}
	}

	newOkResponse(c, http.StatusOK)
}

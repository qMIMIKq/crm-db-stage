package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"strings"
)

func (h *Handler) addOrders(c *gin.Context) {
	var orders []*domain.Order

	if err := c.Bind(&orders); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	//log.Info().Interface("order", orders).Msg("orders is")
	//fmt.Println("ADD ORDER")

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
	var params domain.GetOrder
	if err := c.Bind(&params); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	orders, err := h.services.GetOrders(params)
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

func (h *Handler) deleteOrder(c *gin.Context) {
	orderId := c.Param("id")
	id, err := strconv.Atoi(orderId)
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	err = h.services.Orders.DeleteOrderByID(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newOkResponse(c, http.StatusOK)
}

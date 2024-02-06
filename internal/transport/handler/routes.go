package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) deleteRoute(c *gin.Context) {
	routeID := c.Param("id")

	if err := h.services.DeleteRoute(routeID); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newOkResponse(c, http.StatusOK)
}

func (h *Handler) getRouteByID(c *gin.Context) {
	var id int
	if err := c.Bind(&id); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	route := h.services.Routes.GetRouteByID(id)
	newDataResponse(c, 200, route)
}

func (h *Handler) updateRoute(c *gin.Context) {
	var route *domain.Route
	if err := c.Bind(&route); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	if err := h.services.Routes.UpdateRoute(route); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
	}

	newOkResponse(c, http.StatusOK)
}

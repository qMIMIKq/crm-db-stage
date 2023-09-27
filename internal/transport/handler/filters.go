package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) getFilters(c *gin.Context) {
	filters, err := h.services.Filters.GetFilters(false)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, http.StatusOK, filters)
}

func (h *Handler) getFilter(c *gin.Context) {
	data := map[string]string{}
	if err := c.Bind(&data); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	filter, err := h.services.Filters.GetFilterByID(data["id"])
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	newDataResponse(c, 200, filter)
}

func (h *Handler) getByHiddenFilters(c *gin.Context) {
	filters, err := h.services.Filters.GetFilters(true)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"data": filters,
	})
}

func (h *Handler) addFilter(c *gin.Context) {
	var filter domain.FilterInfo
	if err := c.Bind(&filter); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	id, err := h.services.Filters.CreateFilter(filter)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"id": id,
	})
}

func (h *Handler) editFilter(c *gin.Context) {
	var filter domain.FilterInfo
	if err := c.Bind(&filter); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	if err := h.services.Filters.EditFilter(filter); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"status": "ok",
	})
}

func (h *Handler) editFilterPosition(c *gin.Context) {
	var filters []domain.FilterInfo
	if err := c.Bind(&filters); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	if err := h.services.Filters.UpdatePosition(filters); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"status": "ok",
	})
}

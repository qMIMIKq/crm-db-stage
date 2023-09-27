package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) getGroups(c *gin.Context) {
	groups, err := h.services.Groups.GetGroups()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string][]domain.Group{
		"data": groups,
	})
}

func (h *Handler) editGroup(c *gin.Context) {
	var group domain.Group
	if err := c.Bind(&group); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	err := h.services.Groups.EditGroup(group)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"status": "ok",
	})
}

func (h *Handler) getGroup(c *gin.Context) {
	data := map[string]string{}
	if err := c.Bind(&data); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	group, err := h.services.Groups.GetGroupByID(data["id"])
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, 200, group)
}

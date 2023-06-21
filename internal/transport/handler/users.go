package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
	"net/http"
)

func (h *Handler) getOperators(c *gin.Context) {
	store := ginSession.FromContext(c)

	user, _ := store.Get("userInfo")
	userInfo := user.(domain.UserInfo)

	users, err := h.services.Users.GetUsersByGroupAndPlot(userInfo)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"data": users,
	})
}

func (h *Handler) getUsers(c *gin.Context) {
	users, err := h.services.Users.GetUsers()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"data": users,
	})
}

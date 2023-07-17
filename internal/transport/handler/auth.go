package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
	"github.com/rs/zerolog/log"
	"net/http"
)

func (h *Handler) signIn(c *gin.Context) {
	var user domain.UserAuth

	if err := c.BindJSON(&user); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	userInfo, err := h.services.Authorization.GetUser(user)
	if err != nil {
		newErrorResponse(c, http.StatusUnauthorized, err)
		return
	}

	log.Info().Interface("user", userInfo).Msg("users")

	store := ginSession.FromContext(c)
	userInfo.Login = user.Login
	userInfo.Password = user.Password
	store.Set("userID", userInfo.ID)
	store.Set("userInfo", userInfo)

	err = store.Save()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
	}

	newDataResponse(c, http.StatusOK, map[string]interface{}{
		"name":     userInfo.Name,
		"group":    userInfo.Group,
		"plot":     userInfo.Plot,
		"nickname": userInfo.Nickname,
	})
}

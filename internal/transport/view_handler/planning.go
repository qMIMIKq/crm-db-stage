package view_handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
	"net/http"
)

func (h *ViewHandler) planningView(c *gin.Context) {
	store := ginSession.FromContext(c)

	user, _ := store.Get("userInfo")
	userInfo := user.(domain.UserInfo)

	c.HTML(http.StatusOK, "plan.html", gin.H{
		"Title":   "Планирование",
		"User":    userInfo,
		"GroupID": userInfo.GroupID,
	})
}

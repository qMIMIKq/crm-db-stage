package view_handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
	"net/http"
)

func (h ViewHandler) reportView(c *gin.Context) {
	store := ginSession.FromContext(c)

	user, _ := store.Get("userInfo")
	userInfo := user.(domain.UserInfo)

	c.HTML(http.StatusOK, "report.html", gin.H{
		"Title":   "Отчёт План/Факт",
		"User":    userInfo,
		"GroupID": userInfo.GroupID,
	})
}

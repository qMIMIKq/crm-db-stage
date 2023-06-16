package view_handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
	"net/http"
)

func (h *ViewHandler) indexView(c *gin.Context) {
	store := ginSession.FromContext(c)

	user, _ := store.Get("userInfo")
	userInfo := user.(domain.UserInfo)

	c.HTML(http.StatusOK, "index.html", gin.H{
		"Title": "Главная страница",
		"User":  userInfo,
	})
}

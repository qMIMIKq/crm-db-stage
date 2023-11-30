package view_handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *ViewHandler) reportView(c *gin.Context) {
	//store := ginSession.FromContext(c)
	//
	//user, _ := store.Get("userInfo")
	//userInfo := user.(domain.UserInfo)

	c.HTML(http.StatusOK, "report.html", gin.H{
		"Title": "План/Факт",
	})
}

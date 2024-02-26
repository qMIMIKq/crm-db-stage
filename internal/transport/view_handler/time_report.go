package view_handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *ViewHandler) timeReportView(c *gin.Context) {
	//store := ginSession.FromContext(c)
	//
	//user, _ := store.Get("userInfo")
	//userInfo := user.(domain.UserInfo)

	c.HTML(http.StatusOK, "timeReport.html", gin.H{
		"Title": "Время ожидания",
	})
}

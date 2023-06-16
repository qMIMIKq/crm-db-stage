package view_handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *ViewHandler) loginView(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", gin.H{
		"Title": "Форма входа",
	})
}

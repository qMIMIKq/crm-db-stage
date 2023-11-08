package view_handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *ViewHandler) planningView(c *gin.Context) {

	c.HTML(http.StatusOK, "plan.html", gin.H{
		"Title": "Планирование",
	})
}

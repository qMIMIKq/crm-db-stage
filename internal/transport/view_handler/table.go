package view_handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *ViewHandler) indexView(c *gin.Context) {
	//store := ginSession.FromContext(c)
	//
	//_, ok := store.Get("userInfo")
	//if !ok {
	//	log.Info().Msg("BEDA BEDA((")
	//	//c.Redirect(http.StatusFound, "/login")
	//	return
	//}

	c.HTML(http.StatusOK, "index.html", gin.H{
		"Title": "Заказы",
	})
}

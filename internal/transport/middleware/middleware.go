package middleware

import (
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
)

func CheckAuth(c *gin.Context) {
	store := ginSession.FromContext(c)

	_, ok := store.Get("userID")
	if !ok {
		//c.Redirect(http.StatusFound, "/login")
		//log.Info().Msg("Fix this!!")
		//return
	}
}

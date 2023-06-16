package middleware

import (
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
	"github.com/rs/zerolog/log"
	"net/http"
	"time"
)

func CheckAuth(c *gin.Context) {
	store := ginSession.FromContext(c)

	_, ok := store.Get("userID")
	if !ok {
		c.Redirect(http.StatusFound, "/login")
		return
	}
}

func LoggerMiddleware(c *gin.Context) {
	log.Info().Msgf("Method [%s] - time [%s]", c.Request.Method, time.Now().Format(time.DateTime))
	c.Next()
}

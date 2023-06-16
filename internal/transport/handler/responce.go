package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type err struct {
	Message string `json:"message"`
}

func newErrorResponse(c *gin.Context, status int, msg error) {
	log.Warn().Msgf("error is %s", msg)
	c.AbortWithStatusJSON(status, err{msg.Error()})
}

func newOkResponse(c *gin.Context, status int) {
	c.JSON(status, map[string]interface{}{
		"status": "ok",
	})
}

func newDataResponse(c *gin.Context, status int, data interface{}) {
	c.JSON(status, map[string]interface{}{
		"data": data,
	})
}

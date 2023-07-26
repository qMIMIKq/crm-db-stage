package handler

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) theoreticTime(c *gin.Context) {
	var timeInfo domain.TimeInfo
	if err := c.Bind(&timeInfo); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	result := h.services.Time.CalcTheoreticTime(timeInfo)

	//log.Info().Interface("info is", timeInfo).Msg("Time info")
	c.JSON(http.StatusOK, map[string]string{
		"result": result,
	})
}

func (h *Handler) dynamicTime(c *gin.Context) {

}

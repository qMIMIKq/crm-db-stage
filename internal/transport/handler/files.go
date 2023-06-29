package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) saveFiles(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	data, err := h.services.Files.SaveFiles(c, form.File["files"])
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, http.StatusOK, data)
}

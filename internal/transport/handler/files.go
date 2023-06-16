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

	files := form.File["files"]

	data, err := h.services.Files.SaveFiles(c, files)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, http.StatusOK, data)
}

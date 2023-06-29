package services

import (
	"crm/internal/repository"
	"github.com/gin-gonic/gin"
	"mime/multipart"
	"strings"
)

type FilesService struct {
	repo repository.Files
}

func (f *FilesService) SaveFiles(c *gin.Context, files []*multipart.FileHeader) ([]string, error) {
	return f.repo.SaveFiles(c, files)
}

func (f *FilesService) RemoveFile(orderID string, fileName string) error {
	if strings.HasSuffix(fileName, "pdf") || strings.HasSuffix(fileName, "PDF") {
		err := f.repo.RemoveFile(orderID, fileName[:len(fileName)-3]+"png")
		if err != nil {
			return err
		}
	}

	return f.repo.RemoveFile(orderID, fileName)
}

func NewFilesService(repo repository.Files) *FilesService {
	return &FilesService{repo: repo}
}

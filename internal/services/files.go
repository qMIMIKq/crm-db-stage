package services

import (
	"crm/internal/repository"
	"github.com/gin-gonic/gin"
	"mime/multipart"
)

type FilesService struct {
	repo repository.Files
}

func (f *FilesService) SaveFiles(c *gin.Context, files []*multipart.FileHeader) ([]string, error) {
	return f.repo.SaveFiles(c, files)
}

func NewFilesService(repo repository.Files) *FilesService {
	return &FilesService{repo: repo}
}

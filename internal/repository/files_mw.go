package repository

import (
	"github.com/gin-gonic/gin"
	"gopkg.in/gographics/imagick.v3/imagick"
	"mime/multipart"
	"strings"
)

type FilesMW struct {
	mw *imagick.MagickWand
}

func NewFilesMW(mw *imagick.MagickWand) *FilesMW {
	return &FilesMW{
		mw: mw,
	}
}

const DataPath = "./assets/uploads/"

func (f *FilesMW) SaveFiles(c *gin.Context, files []*multipart.FileHeader) ([]string, error) {
	var newFiles []string

	for _, file := range files {
		filePath := DataPath + file.Filename
		fileType := strings.Split(file.Filename, ".")

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			return nil, err
		}

		newFiles = append(newFiles, filePath)
		switch fileType[len(fileType)-1] {
		case "pdf", "PDF":
			name := filePath[:len(filePath)-3] + "png"
			newFiles = append(newFiles, name)

			err := f.mw.ReadImage(filePath)
			f.mw.SetIteratorIndex(0)
			err = f.mw.SetImageCompression(imagick.COMPRESSION_JPEG)
			err = f.mw.SetImageCompressionQuality(20)
			err = f.mw.SetImageFormat("png")
			err = f.mw.WriteImage(name)

			return newFiles, err
		}
	}

	return newFiles, nil
}

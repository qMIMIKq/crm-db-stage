package repository

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"gopkg.in/gographics/imagick.v3/imagick"
	"mime/multipart"
	"strings"
)

type FilesMW struct {
}

func NewFilesMW() *FilesMW {
	return &FilesMW{}
}

const DataPath = "./assets/uploads/"

func (f *FilesMW) SaveFiles(c *gin.Context, files []*multipart.FileHeader) ([]string, error) {
	var newFiles []string

	for _, file := range files {
		filePath := DataPath + file.Filename
		fileType := strings.Split(file.Filename, ".")

		fmt.Println(file.Filename)
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			return nil, err
		}

		newFiles = append(newFiles, filePath)
		switch fileType[len(fileType)-1] {
		case "pdf", "PDF":
			name := filePath[:len(filePath)-3] + "png"
			newFiles = append(newFiles, name)

			imagick.Initialize()
			defer imagick.Terminate()

			mw := imagick.NewMagickWand()
			defer mw.Destroy()

			err := mw.ReadImage(filePath)
			mw.SetIteratorIndex(0)
			err = mw.SetImageCompression(imagick.COMPRESSION_JPEG)
			err = mw.SetImageCompressionQuality(20)
			err = mw.SetImageFormat("png")
			err = mw.WriteImage(name)

			return newFiles, err
		}
	}

	return newFiles, nil
}

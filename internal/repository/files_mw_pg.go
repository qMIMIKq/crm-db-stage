package repository

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"gopkg.in/gographics/imagick.v3/imagick"
	"mime/multipart"
	"os"
	"strings"
)

type FilesMwPg struct {
	db *sqlx.DB
	mw *imagick.MagickWand
}

const DataPath = "./assets/uploads/"

func (f *FilesMwPg) SaveFiles(c *gin.Context, files []*multipart.FileHeader) ([]string, error) {
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

func (f *FilesMwPg) RemoveFile(orderID string, fileName string) error {
	fullPath := DataPath + fileName

	fileDeleteQuery := fmt.Sprintf(`
		DELETE FROM files WHERE order_id = $1 AND file_name = $2
	`)

	fileCheckQuery := fmt.Sprintf(`
		SELECT file_id 
	    FROM files 
     WHERE order_id <> $1 AND file_name = $2
     LIMIT 1
	`)

	var id int
	err := f.db.Get(&id, fileCheckQuery, orderID, fullPath)
	if id == 0 {
		err = os.RemoveAll(fullPath)
	}

	_, err = f.db.Exec(fileDeleteQuery, orderID, fullPath)
	return err
}

func NewFilesMwPg(db *sqlx.DB, mw *imagick.MagickWand) *FilesMwPg {
	return &FilesMwPg{
		db: db,
		mw: mw,
	}
}

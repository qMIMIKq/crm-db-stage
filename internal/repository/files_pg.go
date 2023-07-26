package repository

import (
	"bytes"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
)

type FilesMwPg struct {
	db *sqlx.DB
	//mw *imagick.MagickWand
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

		client := &http.Client{}
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)
		fw, err := writer.CreateFormFile("file", file.Filename)
		if err != nil {
			log.Fatal().Caller().Err(err).Msg("error")
		}

		newFiles = append(newFiles, filePath)
		switch fileType[len(fileType)-1] {
		case "pdf", "PDF":
			name := filePath[:len(filePath)-3] + "png"
			newFiles = append(newFiles, name)

			file, err := os.Open(filePath)
			if err != nil {
				log.Fatal().Caller().Err(err).Msg("error")
			}
			_, err = io.Copy(fw, file)
			writer.Close()

			req, err := http.NewRequest(http.MethodPost, "http://91.142.94.150:5001/pdf-convert", bytes.NewReader(body.Bytes()))
			req.Header.Set("Content-Type", writer.FormDataContentType())
			rsp, _ := client.Do(req)
			if rsp.StatusCode != http.StatusOK {
				log.Warn().Msgf("FUCK")
			}

			return newFiles, err

		case "DXF", "dxf":
			name := filePath[:len(filePath)-3] + "png"
			newFiles = append(newFiles, name)

			file, err := os.Open(filePath)
			if err != nil {
				log.Fatal().Caller().Err(err).Msg("error")
			}
			_, err = io.Copy(fw, file)
			writer.Close()

			req, err := http.NewRequest(http.MethodPost, "http://91.142.94.150:5001/dxf-convert", bytes.NewReader(body.Bytes()))
			req.Header.Set("Content-Type", writer.FormDataContentType())
			rsp, _ := client.Do(req)
			if rsp.StatusCode != http.StatusOK {
				log.Warn().Msgf("FUCK")
			}

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

func NewFilesMwPg(db *sqlx.DB) *FilesMwPg {
	return &FilesMwPg{
		db: db,
	}
}

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
}

const DataPath = "./assets/uploads/"

func (f *FilesMwPg) SaveFiles(c *gin.Context, files []*multipart.FileHeader) ([]string, error) {
	var newFiles []string

	for _, file := range files {
		//log.Info().Interface("file", file).Caller().Msgf("file")
		//log.Info().Msgf("file name %v", file.Filename)

		filePath := DataPath + file.Filename
		fileType := strings.Split(file.Filename, ".")
		//log.Info().Interface("filepath", filePath).Interface("filetype", fileType).Msg("FILES IS")

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

		checkType := strings.ToLower(fileType[len(fileType)-1])
		switch checkType {
		case "pdf", "dxf":
			name := filePath[:len(filePath)-3] + "png"
			newFiles = append(newFiles, name)

			file, err := os.Open(filePath)
			if err != nil {
				log.Fatal().Caller().Err(err).Msg("error")
			}

			if _, err = io.Copy(fw, file); err != nil {
				log.Fatal().Caller().Err(err).Msg("error")
			}
			writer.Close()

			var url string
			if checkType == "pdf" {
				//url = "http://192.168.0.106:5001/pdf-convert"
				url = "http://app-converter:5000/pdf-convert"
			} else {
				//url = "http://192.168.0.106:5001/dxf-convert"
				url = "http://app-converter:5000/dxf-convert"
			}

			req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body.Bytes()))
			req.Header.Set("Content-Type", writer.FormDataContentType())
			if rsp, _ := client.Do(req); rsp != nil && rsp.StatusCode != http.StatusOK {
				log.Warn().Msgf("FUCK")
				//return nil, errors.New("can't convert file")
			}
		}
	}

	return newFiles, nil
}

func (f *FilesMwPg) RemoveFile(orderID string, fileName string) error {
	fullPath := DataPath + fileName

	log.Info().Caller().Msgf("file name is %v", fileName)

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
	if id != 0 {
		log.Warn().Msgf("File already in use")
	}

	err = os.RemoveAll(fullPath)

	_, err = f.db.Exec(fileDeleteQuery, orderID, fullPath)
	return err
}

func NewFilesMwPg(db *sqlx.DB) *FilesMwPg {
	return &FilesMwPg{
		db: db,
	}
}

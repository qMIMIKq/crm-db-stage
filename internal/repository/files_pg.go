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

const DataPath = "./assets/uploads"

func (f *FilesMwPg) SaveFiles(c *gin.Context, dataFiles *multipart.Form) ([]string, error) {
	var newFiles []string
	files := dataFiles.File["files"]

	id := dataFiles.Value["id"][0]
	hash := dataFiles.Value["hash"][0]

	for _, file := range files {
		fileType := strings.Split(file.Filename, ".")
		checkType := strings.ToLower(fileType[len(fileType)-1])

		//hashName := strings.Replace(checkType)

		//log.Info().Interface("file", file).Caller().Msgf("file")
		//log.Info().Msgf("file name %v", file.Filename)

		//filePath := fmt.Sprintf("%v/%v/%v", DataPath, id, file.Filename)
		filePath := fmt.Sprintf("%v/%v/%v%v", DataPath, id, hash, file.Filename)
		log.Info().Caller().Msgf("file is %v", filePath)

		//log.Info().Interface("filepath", filePath).Interface("filetype", fileType).Msg("FILES IS")

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			return nil, err
		}

		client := &http.Client{}
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)
		fileWriter, err := writer.CreateFormFile("file", file.Filename)
		if err != nil {
			log.Fatal().Caller().Err(err).Msg("error")
		}

		//fieldWriter, err := writer.CreateFormField("id")
		//if err != nil {
		//	log.Fatal().Caller().Err(err).Msg("error")
		//}
		//if _, err = fieldWriter.Write([]byte(id)); err != nil {
		//	log.Fatal().Caller().Err(err).Msg("error")
		//}

		newFiles = append(newFiles, filePath)

		switch checkType {
		case "pdf", "dxf":
			name := filePath[:len(filePath)-3] + "png"
			newFiles = append(newFiles, name)

			file, err := os.Open(filePath)
			if err != nil {
				log.Fatal().Caller().Err(err).Msg("error")
			}

			if _, err = io.Copy(fileWriter, file); err != nil {
				log.Fatal().Caller().Err(err).Msg("error")
			}

			fieldWriter, err := writer.CreateFormField("id")
			if err != nil {
				log.Err(err).Msg("error")
			}

			if _, err := fieldWriter.Write([]byte(id)); err != nil {
				log.Err(err).Msg("error")
			}

			fieldWriter, err = writer.CreateFormField("hash")
			if err != nil {
				log.Err(err).Msg("error")
			}
			if _, err := fieldWriter.Write([]byte(hash)); err != nil {
				log.Err(err).Msg("error")
			}

			writer.Close()

			var url string
			if checkType == "pdf" {
				url = "http://localhost:5001/pdf-convert"
				//url = "http://app-converter:5000/pdf-convert"
			} else {
				url = "http://localhost:5001/dxf-convert"
				//url = "http://app-converter:5000/dxf-convert"
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
	fullPath := fmt.Sprintf("%v/%v/%v", DataPath, orderID, fileName)

	log.Info().Caller().Msgf("file name is %v / path is %v / order id is %v", fileName, fullPath, orderID)

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

	_, err = f.db.Exec(fileDeleteQuery, orderID, fullPath)
	if err != nil {
		log.Err(err).Caller().Msg("error")
	}

	err = os.RemoveAll(fullPath)
	if err != nil {
		log.Err(err).Caller().Msg("error")
	}

	fullPath = fmt.Sprintf("%v/%v", DataPath, fileName)
	log.Info().Caller().Msgf("prev path is %v", fullPath)

	_, err = f.db.Exec(fileDeleteQuery, orderID, fullPath)
	err = os.RemoveAll(fullPath)
	if err != nil {
		log.Err(err).Msg("error")
	}

	return err
}

func NewFilesMwPg(db *sqlx.DB) *FilesMwPg {
	return &FilesMwPg{
		db: db,
	}
}

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

	log.Info().Interface("files", dataFiles).Msg("Save files")

	id := dataFiles.Value["id"][0]
	hash := dataFiles.Value["hash"][0]

	log.Info().Interface("data", dataFiles).Msg("data is")
	log.Info().Msgf("id is %v / hash is %v", id, hash)

	for _, file := range files {
		fileType := strings.Split(file.Filename, ".")
		checkType := strings.ToLower(fileType[len(fileType)-1])

		//hashName := strings.Replace(checkType)

		//log.Info().Interface("file", file).Caller().Msgf("file")
		//log.Info().Msgf("file name %v", file.Filename)

		log.Info().Msgf("file splitted is %v", checkType)

		filePath := fmt.Sprintf("%v/%v/%v", DataPath, id, file.Filename)
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
		log.Info().Interface("files", newFiles).Msg("files is")

		switch checkType {
		case "pdf", "dxf":
			name := filePath[:len(filePath)-3] + "png"
			log.Info().Caller().Msgf("name is %v", name)
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

	log.Info().Caller().Msgf("file name is %v / path is %v", fileName, fullPath)

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
	if err != nil {
		log.Err(err).Msg("error")
	}

	_, err = f.db.Exec(fileDeleteQuery, orderID, fullPath)
	return err
}

func NewFilesMwPg(db *sqlx.DB) *FilesMwPg {
	return &FilesMwPg{
		db: db,
	}
}

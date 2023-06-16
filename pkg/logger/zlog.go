package logger

import (
	"github.com/rs/zerolog"
	"strconv"
	"time"
)

func CustomizeLogger() {
	zerolog.CallerMarshalFunc = func(_ uintptr, file string, line int) string {
		short := file
		for i := len(file) - 1; i > 0; i-- {
			if file[i] == '/' {
				short = file[i+1:]
				break
			}
		}

		file = short
		return file + ":" + strconv.Itoa(line)
	}

	zerolog.TimeFieldFormat = time.DateTime
}

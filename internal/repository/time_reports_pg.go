package repository

import (
	"crm/internal/domain"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"strings"
	"time"
)

type TimeReportsPG struct {
	db     *sqlx.DB
	layout string
}

type DateTimeInfo struct {
	TimeOfCreation string     `json:"time_of_creation"`
	TimeOfStart    string     `json:"time_of_start"`
	TimeOfEnd      string     `json:"time_of_end"`
	TimesOfErrors  []stopInfo `json:"times_of_errors"`
	TimesOfPauses  []stopInfo `json:"times_of_pauses"`
}

type stopInfo struct {
	Start string `json:"start"`
	Stop  string `json:"stop"`
}

type TimeReportInfo struct {
	BeforeStart    time.Duration `json:"before_start"`
	FromStartToEnd time.Duration `json:"from_start_to_end"`
	PausesTime     time.Duration `json:"pauses_time"`
	ErrorsTime     time.Duration `json:"errors_time"`
	FullTime       time.Duration `json:"full_time"`
	RouteID        int           `json:"route_id"`
}

func makeStopInfoData(info *DateTimeInfo, comment domain.Comment) {
	//pauseLength := len(info.TimesOfPauses)
	//var data []stopInfo
	//var stopCase string
	//
	//if strings.Contains(comment.Value, " ПАУЗА ") {
	//	data = info.TimesOfPauses
	//	stopCase = " Сбросил паузу"
	//} else if strings.Contains(comment.Value, " ОШИБКА ") {
	//	data = info.TimesOfErrors
	//	stopCase = " Сбросил ошибку"
	//}
	//
	//if stopCase "!= nil" {
	//
	//}

	pauseLength := len(info.TimesOfPauses)
	if strings.Contains(comment.Value, " ПАУЗА ") {
		if pauseLength == 0 {
			info.TimesOfPauses = append(info.TimesOfPauses, stopInfo{
				Start: comment.Date,
			})
		} else {
			checkEnd := info.TimesOfPauses[pauseLength-1].Stop != ""
			if checkEnd {
				info.TimesOfPauses = append(info.TimesOfPauses, stopInfo{
					Start: comment.Date,
				})
			}
		}
	}

	if strings.Contains(comment.Value, " Сбросил паузу") {
		info.TimesOfPauses[pauseLength-1].Stop = comment.Date
	}
}

func (t *TimeReportsPG) CalcTimeDataForReports(dateReportInfo *DateTimeInfo, resultReportTimeInfo *TimeReportInfo, comment domain.Comment) string {
	comment.Date = strings.ReplaceAll(comment.Date, "-", ".")

	if strings.Contains(comment.Value, " Выбрал этап ") && dateReportInfo.TimeOfCreation == "" {
		//log.Info().Caller().Msgf("value %v", comment.Value)
		//dateReportInfo.SetTimeOfCreation(comment.Date)
		dateReportInfo.TimeOfCreation = comment.Date
	}

	pauseLength := len(dateReportInfo.TimesOfPauses)
	if strings.Contains(comment.Value, " ПАУЗА ") {
		if pauseLength == 0 {
			dateReportInfo.TimesOfPauses = append(dateReportInfo.TimesOfPauses, stopInfo{
				Start: comment.Date,
			})
		} else {
			checkEnd := dateReportInfo.TimesOfPauses[pauseLength-1].Stop != ""
			if checkEnd {
				dateReportInfo.TimesOfPauses = append(dateReportInfo.TimesOfPauses, stopInfo{
					Start: comment.Date,
				})
			}
		}
	}

	if strings.Contains(comment.Value, " Сбросил паузу") {
		dateReportInfo.TimesOfPauses[pauseLength-1].Stop = comment.Date
	}

	errorLength := len(dateReportInfo.TimesOfErrors)
	if strings.Contains(comment.Value, " ОШИБКА ") {
		if errorLength == 0 {
			dateReportInfo.TimesOfErrors = append(dateReportInfo.TimesOfErrors, stopInfo{
				Start: comment.Date,
			})
		} else {
			checkEnd := dateReportInfo.TimesOfErrors[errorLength-1].Stop != ""
			if checkEnd {
				dateReportInfo.TimesOfErrors = append(dateReportInfo.TimesOfErrors, stopInfo{
					Start: comment.Date,
				})
			}
		}

	}

	if strings.Contains(comment.Value, " Сбросил ошибку") {
		dateReportInfo.TimesOfErrors[errorLength-1].Stop = comment.Date
	}

	valueArr := strings.Split(comment.Value, " ")
	statusMsg := valueArr[len(valueArr)-1]

	switch statusMsg {
	case "Начал":
		dateReportInfo.TimeOfStart = comment.Date
	case "Закончил":
		dateReportInfo.TimeOfEnd = comment.Date
	default:
		//log.Info().Caller().Msgf("status msg %v", statusMsg)
	}

	var beforeStart time.Duration
	if dateReportInfo.TimeOfStart != "" {
		beforeStart = t.CalcTimeDifference(dateReportInfo.TimeOfCreation, dateReportInfo.TimeOfStart)
		resultReportTimeInfo.BeforeStart = beforeStart
		//log.Info().Caller().Msgf("before start %s", beforeStart)
	}

	var fromStartToEnd time.Duration
	if dateReportInfo.TimeOfEnd != "" {
		fromStartToEnd = t.CalcTimeDifference(dateReportInfo.TimeOfStart, dateReportInfo.TimeOfEnd)
		resultReportTimeInfo.FromStartToEnd = fromStartToEnd
		//log.Info().Caller().Msgf("from start to end %s", fromStartToEnd)
	}

	var pausesTime time.Duration
	if len(dateReportInfo.TimesOfPauses) > 0 {
		for _, pause := range dateReportInfo.TimesOfPauses {
			if pause.Stop != "" {
				pausesTime += t.CalcTimeDifference(pause.Start, pause.Stop)
			}
		}

		resultReportTimeInfo.PausesTime = pausesTime
		//log.Info().Caller().Msgf("pauses times %s", pausesTime.String())
	}

	var errorsTime time.Duration
	if len(dateReportInfo.TimesOfErrors) > 0 {
		for _, errData := range dateReportInfo.TimesOfErrors {
			if errData.Stop != "" {
				errorsTime += t.CalcTimeDifference(errData.Start, errData.Stop)
			}
		}

		resultReportTimeInfo.ErrorsTime = errorsTime
		//log.Info().Caller().Msgf("errors times %s", errorsTime.String())
	}

	return ""
}

func (t *TimeReportsPG) CalcTimeDifference(startTimeStr string, endTimeStr string) time.Duration {
	startTime, err := time.Parse(t.layout, startTimeStr)
	if err != nil {
		log.Err(err).Msg("error is")
	}

	endTime, err := time.Parse(t.layout, endTimeStr)
	if err != nil {
		log.Err(err).Msg("error is")
	}

	return endTime.Sub(startTime)
}

func NewTimeReportsPG(db *sqlx.DB) *TimeReportsPG {
	return &TimeReportsPG{db: db, layout: "2006.01.02 15:04"}
}

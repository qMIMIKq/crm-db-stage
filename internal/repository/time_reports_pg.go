package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"math"
	"strings"
	"time"
)

type TimeReportsPG struct {
	db     *sqlx.DB
	layout string
}

type TimeCalc struct {
	ShiftStart string
	ShiftEnd   string
}

type DateTimeInfo struct {
	TimeOfCreation string        `json:"time_of_creation"`
	TimeOfStart    string        `json:"time_of_start"`
	TimeOfEnd      string        `json:"time_of_end"`
	TimesOfErrors  []stopInfo    `json:"times_of_errors"`
	TimesOfPauses  []stopInfo    `json:"times_of_pauses"`
	TotalDays      float64       `json:"total_days"`
	CheckShifts    float64       `json:"check_shifts"`
	FullShifts     float64       `json:"full_shifts"`
	FirstDayTime   time.Duration `json:"first_day_time"`
	LastDayTime    time.Duration `json:"last_day_time"`
}

type stopInfo struct {
	Start string `json:"start"`
	Stop  string `json:"stop"`
}

type ResultTimeReportInfo struct {
	BeforeStart    time.Duration `json:"before_start"`
	FromStartToEnd time.Duration `json:"from_start_to_end"`
	PausesTime     time.Duration `json:"pauses_time"`
	ErrorsTime     time.Duration `json:"errors_time"`
	FullTime       time.Duration `json:"full_time"`
	RouteID        int           `json:"route_id"`
	RoutePlot      string        `json:"route_plot"`
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

func (t *TimeReportsPG) CreateTimeData(dateReportInfo *DateTimeInfo, comment domain.Comment) string {
	comment.Date = strings.ReplaceAll(comment.Date, "-", ".")
	//log.Info().Msgf("route plot %v", resultReportTimeInfo.RoutePlot)

	if strings.Contains(comment.Value, " Выбрал этап ") && dateReportInfo.TimeOfCreation == "" {
		//log.Info().Caller().Msgf("value %v", comment.Value)
		//dateReportInfo.SetTimeOfCreation(comment.Date)
		dateReportInfo.TimeOfCreation = comment.Date
	}

	valueArr := strings.Split(comment.Value, " ")
	statusMsg := valueArr[len(valueArr)-1]

	switch statusMsg {
	case "Начал":
		dateReportInfo.TimeOfStart = comment.Date
	case "Закончил":
		dateReportInfo.TimeOfEnd = comment.Date
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

	return ""
}

func (t *TimeReportsPG) CalcTimeDataForReports(dateReportInfo *DateTimeInfo) *ResultTimeReportInfo {
	//log.Info().Interface("data", dateReportInfo).Msgf("date report info is")
	resultReportTimeInfo := &ResultTimeReportInfo{}

	var beforeStart time.Duration
	if dateReportInfo.TimeOfStart != "" {
		beforeStart = t.CalcTimeDifference(dateReportInfo.TimeOfCreation, dateReportInfo.TimeOfStart, dateReportInfo)
		resultReportTimeInfo.BeforeStart = beforeStart
		log.Info().Caller().Msgf("before start %s", beforeStart.String())
	}

	var fromStartToEnd time.Duration
	if dateReportInfo.TimeOfEnd != "" {
		//log.Info().Msgf("calc end")
		fromStartToEnd = t.CalcTimeDifference(dateReportInfo.TimeOfStart, dateReportInfo.TimeOfEnd, dateReportInfo)
		resultReportTimeInfo.FromStartToEnd = fromStartToEnd
		log.Info().Caller().Msgf("from start to end %s", fromStartToEnd)
	}

	var pausesTime time.Duration
	if len(dateReportInfo.TimesOfPauses) > 0 {
		for _, pause := range dateReportInfo.TimesOfPauses {
			if pause.Stop != "" {
				pausesTime += t.CalcTimeDifference(pause.Start, pause.Stop, dateReportInfo)
			}
		}

		resultReportTimeInfo.PausesTime = pausesTime
		log.Info().Caller().Msgf("pauses times %s", pausesTime.String())
	}

	var errorsTime time.Duration
	if len(dateReportInfo.TimesOfErrors) > 0 {
		for _, errData := range dateReportInfo.TimesOfErrors {
			if errData.Stop != "" {
				errorsTime += t.CalcTimeDifference(errData.Start, errData.Stop, dateReportInfo)
			}
		}

		resultReportTimeInfo.ErrorsTime = errorsTime
		//log.Info().Caller().Msgf("errors times %s", errorsTime.String())
	}

	return resultReportTimeInfo
}

var calc = TimeCalc{
	ShiftStart: "08:00",
	ShiftEnd:   "20:00",
}

func (t *TimeReportsPG) CalcTimeDifference(startTimeStr string, endTimeStr string, dateInfo *DateTimeInfo) time.Duration {
	startTime, err := time.Parse(t.layout, startTimeStr)
	if err != nil {
		log.Err(err).Msg("error is")
	}

	endTime, err := time.Parse(t.layout, endTimeStr)
	if err != nil {
		log.Err(err).Msg("error is")
	}

	var checkShifts float64
	firstShiftEndStr := strings.Split(startTimeStr, " ")[0]
	lastShiftStartStr := strings.Split(endTimeStr, " ")[0]

	if firstShiftEndStr != lastShiftStartStr {
		log.Info().Msgf("no one day shift work")
		checkShifts += 2
	}

	firstShiftEndStr += fmt.Sprintf(" %v", calc.ShiftEnd)
	lastShiftStartStr += fmt.Sprintf(" %v", calc.ShiftStart)

	log.Info().Msgf("start time str %v", startTimeStr)
	log.Info().Msgf("end time str %v", endTimeStr)

	firstShiftTime, err := time.Parse(t.layout, firstShiftEndStr)
	if err != nil {
		log.Err(err).Msg("error")
	}

	lastShiftTime, err := time.Parse(t.layout, lastShiftStartStr)
	if err != nil {
		log.Err(err).Msg("error")
	}

	dateInfo.FirstDayTime = firstShiftTime.Sub(startTime)
	dateInfo.LastDayTime = endTime.Sub(lastShiftTime)

	dateInfo.TotalDays = math.Ceil(endTime.Sub(startTime).Hours() / 24)
	dateInfo.CheckShifts = checkShifts
	dateInfo.FullShifts = dateInfo.TotalDays - dateInfo.CheckShifts

	//log.Info().Interface("info after check", dateInfo).Msgf("new info")

	var result time.Duration
	if dateInfo.CheckShifts == 2 {
		log.Info().Msgf("first shift %v / last shift %v", dateInfo.FirstDayTime.String(), dateInfo.LastDayTime.String())
		if dateInfo.FirstDayTime > 0 {
			result += dateInfo.FirstDayTime
		}

		if dateInfo.LastDayTime > 0 {
			result += dateInfo.LastDayTime
		}

		if dateInfo.FullShifts > 0 {
			allShifts := time.Duration(dateInfo.FullShifts) * (12 * time.Hour)
			result += allShifts
		}
	} else {
		return endTime.Sub(startTime)
	}

	return result
}

func (t *TimeReportsPG) CreateTimeReportsPlotReport(route *domain.Route) {
	var timeReportPlot domain.TimeReportPlot
	reportTimePlotsGetQuery := fmt.Sprintf(`
		SELECT * FROM time_reports_plots WHERE route_plot = $1
	`)

	if err := t.db.Get(&timeReportPlot, reportTimePlotsGetQuery, route.Plot); err != nil {
		log.Err(err).Caller().Msg("error is")
	}
	log.Info().Interface("time report plot", timeReportPlot).Msg("report is")

	t.db.Exec(`DELETE FROM time_reports_plots WHERE route_plot = $1`, route.Plot)

	reportTimePlotsQuery := fmt.Sprintf(`
		INSERT INTO time_reports_plots (route_plot, last_start, last_end, prev_expectation, current_expectation, total_expectation, expectation)
				 VALUES ($1, $2 ,$3, $4, $5, $6, $7)
	`)

	if timeReportPlot.ID == 0 {
		if _, err := t.db.Exec(reportTimePlotsQuery, route.Plot, route.StartTime, route.EndTime, "", "", "", ""); err != nil {
			log.Err(err).Caller().Msg("error")
		}
	} else {
		fixStartString := strings.ReplaceAll(timeReportPlot.LastStart, "T", " ")
		fixStartString = strings.ReplaceAll(fixStartString, "Z", "")
		fixStartString = strings.ReplaceAll(fixStartString, "-", ".")
		checkStringArr := strings.Split(fixStartString, " ")
		check := strings.Split(checkStringArr[1], ":")
		fixStartString = fmt.Sprintf(`%v %v:%v`, checkStringArr[0], check[0], check[1])
		log.Info().Msgf("fix string %v", fixStartString)
		prevStart, err := time.Parse(t.layout, fixStartString)
		if err != nil {
			log.Err(err).Caller().Msg("error")
		}
		fixEndString := strings.ReplaceAll(timeReportPlot.LastEnd, "T", " ")
		fixEndString = strings.ReplaceAll(fixEndString, "Z", "")
		fixEndString = strings.ReplaceAll(fixEndString, "-", ".")

		checkStringArr = strings.Split(fixEndString, " ")
		log.Info().Interface("?", checkStringArr).Msg("check string")
		check = strings.Split(checkStringArr[1], ":")
		fixEndString = fmt.Sprintf(`%v %v:%v`, checkStringArr[0], check[0], check[1])

		log.Info().Msgf("fix string end %v", fixEndString)

		prevEnd, err := time.Parse(t.layout, fixEndString)
		if err != nil {
			log.Err(err).Caller().Msg("error")
		}

		currentStart, err := time.Parse(t.layout, strings.ReplaceAll(route.StartTime, "-", "."))
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}

		checkEnd := false
		currentEnd, err := time.Parse(t.layout, strings.ReplaceAll(route.EndTime, "-", "."))
		if err != nil {
			log.Err(err).Caller().Msg("error is")
			checkEnd = false
		} else {
			checkEnd = true
		}

		log.Info().Msgf("prev start %v / prev end %v", prevStart, prevEnd)
		log.Info().Msgf("current start %v / current end %v", currentStart, currentEnd)

		var endString string
		if checkEnd {
			log.Info().Msg("check end")

			if currentEnd.Unix() > prevEnd.Unix() {
				log.Info().Msgf("current end is bigger")

				endString = route.EndTime
			} else {
				log.Info().Msgf("current end is smaller")
				endString = timeReportPlot.LastEnd
			}
		} else {
			log.Info().Msg("no end")

			endString = route.StartTime
		}

		var dateInfo DateTimeInfo
		if currentStart.Unix() > prevEnd.Unix() {
			res := t.CalcTimeDifference(fixEndString, route.StartTime, &dateInfo)
			log.Info().Msgf("res is %v", res.String())

			var newTotal time.Duration
			if timeReportPlot.TotalExpectation != "" {
				prevTotal, err := time.ParseDuration(timeReportPlot.TotalExpectation)
				if err != nil {
					log.Err(err).Caller().Msg("error")
				}

				newTotal += prevTotal + res
			} else {
				newTotal = res
			}

			log.Info().Msgf("i am in if %v", endString)
			if _, err := t.db.Exec(reportTimePlotsQuery, route.Plot, route.StartTime, endString, "", res.String(), newTotal.String(), ""); err != nil {
				log.Err(err).Caller().Msg("error")
			}
		} else {

			log.Info().Msgf("i am in else %v", endString)

			if _, err := t.db.Exec(reportTimePlotsQuery, route.Plot, timeReportPlot.LastStart, endString, "", timeReportPlot.CurrentExpectation, timeReportPlot.TotalExpectation, ""); err != nil {
				log.Err(err).Caller().Msg("error")
			}
		}
	}

	//log.Info().Msgf("route start %v / route end %v", route.StartTime, route.EndTime)
}

func (t *TimeReportsPG) GetTimeReports(datesRange *domain.ReportTime) []domain.TimeReportPlot {
	log.Info().Interface("range is", datesRange).Msg("show range")

	var routes []*domain.Route

	queryRoutes := fmt.Sprintf(`
		SELECT * FROM routes
			WHERE time_of_creation >= $1 AND time_of_creation <= $2
		ORDER BY start_time
	`)

	queryRouteTimeReports := fmt.Sprintf(`
		SELECT * FROM time_reports WHERE route_id = $1
	`)

	if err := t.db.Select(&routes, queryRoutes, datesRange.From, datesRange.To); err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	plots := map[string]string{}

	for _, route := range routes {
		//log.Info().Interface("route", route).Msg("route is")
		if err := t.db.Get(&route.TimeReportsInfo, queryRouteTimeReports, route.RouteID); err != nil {
			//log.Err(err).Caller().Msg("error is")
		}

		plots[route.Plot] = ""

		log.Info().Msgf("plot is %v / created in %v / start time %v", route.Plot, route.TimeOfCreation, route.StartTime)
	}

	//queryPrevRoute := fmt.Sprintf(`
	//	SELECT * FROM routes
	//		WHERE time_of_creation < $1
	//		  AND plot_id = $2
	//			AND end_time != ''
	//   ORDER BY end_time
	//		LIMIT 1
	//`)

	//for plot := range plots {
	//	log.Info().Msgf("plot %v", plot)
	//
	//	var route domain.Route
	//	if err := t.db.Get(&route, queryPrevRoute, datesRange.From, plot); err != nil {
	//		log.Err(err).Caller().Msg("error is")
	//	}
	//	log.Info().Interface("route", route).Msg("prev route")
	//}

	var data []domain.TimeReportPlot
	if err := t.db.Select(&data, `SELECT * FROM time_reports_plots`); err != nil {
		log.Err(err).Caller().Msg("error")
	}

	return data
}

func NewTimeReportsPG(db *sqlx.DB) *TimeReportsPG {
	return &TimeReportsPG{db: db, layout: "2006.01.02 15:04"}
}

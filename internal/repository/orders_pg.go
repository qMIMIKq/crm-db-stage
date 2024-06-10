package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"sort"
	"strconv"
	"strings"
	"time"
)

type OrdersPG struct {
	db            *sqlx.DB
	reportsPG     *ReportsPG
	planningPG    *PlanningPG
	timeReportsPG *TimeReportsPG
}

func (o *OrdersPG) UpdateOrders(orders []*domain.Order) error {
	query := fmt.Sprintf(`
			UPDATE orders 
				 SET order_number = $1 ,order_sample = $2, order_client = $3, order_name = $4,
						 order_material = $5, order_quantity = $6, order_issued = $7, order_m = $8,
						 order_endtime = $9, order_otk = $10, order_p = $11, completed = $12, time_of_modify = $13
			WHERE order_id = $14
	`)

	fileQuery := fmt.Sprintf(`
	  INSERT INTO files
						(file_name, order_id)
		 VALUES ($1, $2)
	`)

	getFilesQuery := fmt.Sprintf(`
		SELECT file_name FROM files WHERE order_id = $1
	`)

	commentsQuery := fmt.Sprintf(`
		INSERT INTO comments (comment_text, order_id)
		VALUES ($1, $2)	
	`)

	var files []string
	layout := "2006-01-02"
	loc, _ := time.LoadLocation("Europe/Moscow")
	today := time.Now().In(loc).Format(layout)

	var err error
	for _, order := range orders {
		timeOfModify := time.Now().In(loc).Format("2006-01-02 15:04:05")
		order.CanRemove = "yes"

		if order.EndTime != "" {
			_, err = o.db.Exec(query, order.Number, order.Sample,
				order.Client, order.Name, order.Material, order.Quantity,
				order.Issued, order.M, order.EndTime, order.OTK,
				order.P, order.Completed, timeOfModify, order.ID)
		} else {
			_, err = o.db.Exec(query, order.Number, order.Sample,
				order.Client, order.Name, order.Material, order.Quantity,
				order.Issued, order.M, nil, order.OTK,
				order.P, order.Completed, timeOfModify, order.ID)
		}
		if err != nil {
			log.Err(err).Caller().Msg("Error")
		}

		err = o.db.Select(&files, getFilesQuery, order.ID)
		for _, file := range order.Files {
			if file != "" && !o.findFile(files, file) {
				_, err = o.db.Exec(fileQuery, file, order.ID)
				if err != nil {
					log.Err(err).Caller().Msg("Error")
				}
			}
		}

		for _, comment := range order.Comments {
			if comment != "" {
				_, err = o.db.Exec(commentsQuery, comment, order.ID)
				if err != nil {
					log.Err(err).Caller().Msg("Error")
				}
			}
		}

		routesQuery := fmt.Sprintf(`
			INSERT INTO routes (order_id, route_position, worker, plot_id, quantity,
													issued, start_time, end_time, pause_time, error_time, 
													error_value, day_quantity, theor_end, dyn_end, plan_date, 
 												  plan_start, plan_faster, plan_exclude_days, last_comment, 
			                    plan_dates, planned, issued_plan, time, up, adjustment, need_shifts, shift, alert_color, time_of_creation)
						 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
			RETURNING route_id
		`)

		routeCommentsQuery := fmt.Sprintf(`
			INSERT INTO route_comments (route_id, date, value) VALUES ($1, $2, $3)
		`)

		//routesCheck := fmt.Sprintf(`
		//		SELECT route_id, route_position FROM routes WHERE order_id = $1 AND route_position = $2 LIMIT 1
		//`)

		routesUpdateQuery := fmt.Sprintf(`
			UPDATE routes SET worker = $1, plot_id = $2, quantity = $3,
						 issued = $4, start_time = $5, end_time = $6,
						 pause_time = $7, pause_value = $8, error_time = $9, error_value = $10, day_quantity = $11, 
						 theor_end = $12, dyn_end = $13, plan_date = $14, plan_start = $15,
						 plan_faster = $16, plan_exclude_days = $17, last_comment = $18, plan_dates = $19, 
						 planned = $20, issued_plan = $21, time = $22, up = $23, adjustment = $24, need_shifts = $25, shift = $26, alert_color = $27, route_position = $28
		  WHERE route_id = $29
			RETURNING route_id
		`)

		//planUpdateQuery := fmt.Sprintf(`
		//	UPDATE plans
		//		 SET route_plot = $1, divider = $2, queues = $3
		//	 WHERE route_id = $4 AND plan_date = $5
		//`)

		onlyOneFlag := false

	routesLoop:
		for name, route := range order.Routes {
			if !route.IsUpdated {
				//log.Info().Msgf("not updated route %v", route.RoutePosition)
				continue routesLoop
			}
			log.Info().Caller().Msgf("updated route %v", route.RoutePosition)

			var routeID int
			routePos := strings.Split(name, "-")[1]

			var check bool
			if route.RouteID != "" {
				check = true
			}

			if check {
				var planDates []string
				for _, info := range route.AddedDates {
					//log.Info().Msgf("added date is %v", info.Date)
					planDates = append(planDates, info.Date)
				}

				err = o.db.QueryRow(routesUpdateQuery, route.User, route.Plot,
					route.Quantity, route.Issued, route.StartTime, route.EndTime,
					route.PauseTime, route.PauseMsg, route.ErrorTime, route.ErrorMsg, route.DayQuantity,
					route.TheorEnd, route.DynEnd, route.PlanDate, route.PlanStart, route.PlanFaster,
					route.PlanExcludeDays, route.LastComment, strings.Join(planDates, ", "),
					route.Planned, route.IssuedToday, route.Time, route.Up,
					route.Adjustment, route.NeedShifts, route.Shift, route.AlertColor,
					routePos, route.RouteID).Scan(&routeID)
				log.Info().Msgf("route id is %v", routeID)

				if err != nil {
					log.Err(err).Caller().Msg("Error")
				}

				if err = o.reportsPG.RemoveForUpdateReports(routeID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				if len(route.AddedDates) > 0 {
					o.planningPG.CreatePlanningObject(route, order, order.ID, routePos, routeID, false)
				}

				planQuery := fmt.Sprintf(`
					INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
							 VALUES ($1, $2, $3, $4, $5, $6)
				`)

				//_, err = o.db.Exec("DELETE FROM plans WHERE route_id = $1", dbRoutePos[0].RouteID)
				_, err = o.db.Exec("DELETE FROM plans WHERE route_id = $1 AND plan_date >= $2", routeID, today)

			datesLoop:
				for _, info := range route.AddedDates {
					checkPlanDate, _ := time.Parse(layout, strings.Split(info.Date, "T")[0])
					checkToday, _ := time.Parse(layout, today)

					if route.EndTime != "" {

						if checkPlanDate.Unix() > checkToday.Unix() {
							continue datesLoop
						}
					}

					if checkPlanDate.Unix() >= checkToday.Unix() {
						_, err := o.db.Exec(planQuery, routeID, order.ID, route.Plot, info.Date, info.DateInfo.Divider, strings.Join(info.DateInfo.Queues, ", "))
						if err != nil {
							log.Err(err).Caller().Msg("ERROR")
						}
					}

					reportQuery := fmt.Sprintf(`
						INSERT INTO reports
									 (report_date, order_id, order_number, order_client, 
									  order_name, quantity, issued, plan, 
									  operator, issued_plan, order_material, order_plot, 
									  adding_date, route_position, route_id, order_timestamp,
									  shift, need_shifts)
						VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
						RETURNING report_id
					`)

					if checkPlanDate.Unix() >= checkToday.Unix() {
						issued, _ := strconv.Atoi(route.Issued)
						//log.Info().Caller().Msgf("date is %v today is %v theor end %v", info.Date, today, route.TheorEnd)

						var dayQuantity string
						if strings.Contains(route.DayQuantity, "/") {
							dayQuantity = strings.Split(route.DayQuantity, "/")[0]
						} else {
							dayQuantity = route.DayQuantity
						}

						var reportID int
						err = o.db.QueryRow(
							reportQuery, info.Date, order.ID, order.Number, order.Client,
							order.Name, route.Quantity, issued, dayQuantity,
							"", "", order.Material, route.Plot, today,
							routePos, routeID, route.TheorEnd, route.Shift, route.NeedShifts,
						).Scan(&reportID)
						if err != nil {
							log.Err(err).Caller().Msg("ERROR")
						}
					}
				}

				reportQuery := fmt.Sprintf(`
					INSERT INTO reports
								 (report_date, order_id, order_number, order_client, 
									order_name, quantity, issued, plan, 
									operator, issued_plan, order_material, order_plot, 
									adding_date, route_position, route_id, order_timestamp,
									shift, need_shifts, not_planned, adjustment)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
					RETURNING report_id
				`)

				routeReports := GetIssuedReports(route)

				var keys []string
				for reportDate := range routeReports.ReportsData {
					keys = append(keys, reportDate)
				}
				sort.Strings(keys)
				//log.Info().Interface("keys", keys).Msgf("keys")
				//log.Info().Interface("sorted dates", keys).Msgf("KEYS!!!")

				//log.Info().Interface("RESULT REPORTS", routeReports).Msg("REPORTS!!!")
				//log.Info().Msgf("order id %v / report route id %v / report route plot %v", order.ID, routeReports.RouteID, routeReports.RoutePlot)

				var issuedThisTurn int
				var prevIssued int
				counter := 0
				//canRemoveRoute := true
				for _, reportDate := range keys {
					reportIssued := routeReports.ReportsData[reportDate]
					changerDate, _ := time.Parse(layout, reportDate)
					issuedThisTurn += reportIssued.Issued
					prevIssued = reportIssued.Issued

					if issuedThisTurn < 0 {
						issuedThisTurn = 0
					}

					//log.Info().Caller().Msgf("total issued %v / prev issued %v", issuedThisTurn, prevIssued)

					var shift string
					if reportIssued.Last {
						shift = "Последняя"
					}

					//log.Info().Interface("report", routeReports.ReportsData[reportDate]).Msg("sorted report!")
					//log.Info().Caller().Msgf("report date %v / report issued %v / report adjustment %v / report last %v", changerDate, reportIssued.Issued, reportIssued.Adjustment, shift)

					var checkID int
					if err = o.db.Get(&checkID, `SELECT report_id FROM reports WHERE report_date = $1 AND route_id = $2`, changerDate, route.RouteID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}

					if checkID == 0 {
						var reportID int
						if err = o.db.QueryRow(
							reportQuery, changerDate, order.ID, order.Number, order.Client,
							order.Name, route.Quantity, issuedThisTurn, route.DayQuantity,
							reportIssued.Operator, reportIssued.Issued, order.Material, route.Plot, today,
							routePos, routeID, route.TheorEnd, shift, route.NeedShifts, true, reportIssued.Adjustment,
						).Scan(&reportID); err != nil {
							log.Err(err).Caller().Msg("error is")
						}
						log.Info().Caller().Msgf("new report for date %v with id %v", changerDate, route.RouteID)
					}

					var reports []domain.Report
					err := o.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeReports.RouteID)
					if err != nil {
						log.Err(err).Caller().Msg("error is")
					}

					if len(reports) > 0 {
						//log.Info().Caller().Msgf("can't remove this route %v", route.Plot)
					}

					updateReportInfoQuery := fmt.Sprintf(`
						UPDATE reports
							 SET quantity = $1, need_shifts = $2, plan = $3, order_timestamp = $4, hidden_shift = $5,
							     order_number = $6, order_client = $7, order_name = $8
						 WHERE report_id = $9
					`)

					for i, report := range reports {
						oldReportDate, _ := time.Parse(layout, strings.Split(report.ReportDate, "T")[0])

						//log.Info().Msgf("need shifts %v", route.NeedShifts)
						//log.Info().Caller().Msgf("day quantity %v", dayQuantity)
						if _, err := o.db.Exec(updateReportInfoQuery, route.Quantity, route.NeedShifts,
							route.DayQuantity, route.TheorEnd, i+1, order.Number,
							order.Client, order.Name, report.ReportID,
						); err != nil {
							log.Err(err).Caller().Msg("error is")
						}

						//if i >= route.NeedShifts {
						//	if _, err := o.db.Exec("UPDATE reports SET prev_total = $1 WHERE report_id = $2", issuedThisTurn-prevIssued, report.ReportID); err != nil {
						//		log.Err(err).Caller().Msg("error is")
						//	}
						//}

						if changerDate.Unix() == oldReportDate.Unix() {
							counter += 1

							if _, err := o.db.Exec(`
								UPDATE reports SET issued = $1, issued_plan = $2, operator = $3, current_shift = $4, shift = $5, adjustment = $6, need_shifts = $7, prev_total = $8 WHERE report_id = $9
								`, issuedThisTurn, reportIssued.Issued, reportIssued.Operator, counter, shift, reportIssued.Adjustment, route.NeedShifts, issuedThisTurn-prevIssued, report.ReportID); err != nil {
								log.Err(err).Caller().Msg("error is")
							}
						}
					}
				}

				var reports []domain.Report
				if err = o.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeID); err != nil {
					log.Err(err).Msgf("error is")
				}

				var prevTotal, totalForPlan string
				var shift, hiddenShift int
				checkTheor := false
				for i, report := range reports {
					theorAdjustment := ""
					hiddenShift = report.HiddenShift

					if report.CurrentShift != 0 {
						shift = report.CurrentShift

						//log.Info().Msgf("i %v", i)
						if i != 0 {
							totalForPlan = reports[i-1].Issued
						} else {
							totalForPlan = ""
						}
						//log.Info().Msgf("total %v", totalForPlan)

						if report.CurrentShift == 1 && !checkTheor {
							theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
							checkTheor = true
						}
					} else if !checkTheor {
						theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
						//checkTheor = true
					}

					if _, err := o.db.Exec("UPDATE reports SET prev_total = $1, theor_adjustment = $2  WHERE report_id = $3", prevTotal, theorAdjustment, report.ReportID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}

					prevTotal = report.Issued
					//log.Info().Msgf("hidden shift %v / shift %v / theor adj %v / adj %v", hiddenShift, shift, theorAdjustment, route.Adjustment)
				}

				if hiddenShift >= shift {
					shift -= 1
					if shift < 0 {
						shift = 0
					}
				}

				if checkTheor {
					if _, err = o.db.Exec("UPDATE reports SET theor_adjustment = $1 WHERE current_shift < 1 AND route_id = $2", "", routeID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}
				}

				if _, err = o.db.Exec("UPDATE planning SET shift = $1, order_issued = $2 WHERE route_id = $3", shift, totalForPlan, routeID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				if !onlyOneFlag {
					if len(keys) > 0 {
						order.CanRemove = "no"
						onlyOneFlag = true
					}

					if len(route.StartTime) > 0 {
						order.CanRemove = "no"
						onlyOneFlag = true
					}

					if len(route.AddedDates) > 0 {
						order.CanRemove = "no"
						onlyOneFlag = true
					}

					if len(route.ErrorTime) > 0 {
						order.CanRemove = "no"
						onlyOneFlag = true
					}

					if len(route.PauseTime) > 0 {
						order.CanRemove = "no"
						onlyOneFlag = true
					}
				}

				dateReportInfo := &DateTimeInfo{}
				_, err = o.db.Exec("DELETE FROM route_comments WHERE route_id = $1", routeID)
				for _, comment := range route.Comments {
					if len(comment.Date) > 0 {
						o.timeReportsPG.CreateTimeData(dateReportInfo, comment)
						_, err = o.db.Exec(routeCommentsQuery, routeID, comment.Date, comment.Value)
					}
				}

				resultReportTimeInfo := o.timeReportsPG.CalcTimeDataForReports(dateReportInfo)
				resultReportTimeInfo.RouteID = routeID
				resultReportTimeInfo.RoutePlot = route.Plot
				resultReportTimeInfo.FullTime = resultReportTimeInfo.BeforeStart + resultReportTimeInfo.FromStartToEnd + resultReportTimeInfo.ErrorsTime + resultReportTimeInfo.PausesTime

				if _, err := o.db.Exec("DELETE FROM time_reports WHERE route_id = $1", routeID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				reportTimeQuery := fmt.Sprintf(`
					INSERT INTO time_reports (route_id, route_plot, before_start, from_start_to_end, error, paused, full_time)
					     VALUES ($1, $2, $3, $4, $5, $6, $7)
				`)

				if _, err := o.db.Exec(reportTimeQuery, routeID, route.Plot,
					resultReportTimeInfo.BeforeStart.String(), resultReportTimeInfo.FromStartToEnd.String(),
					resultReportTimeInfo.ErrorsTime.String(), resultReportTimeInfo.PausesTime.String(), resultReportTimeInfo.FullTime.String()); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				if route.StartTime != "" || route.EndTime != "" {
					o.timeReportsPG.CreateTimeReportsPlotReport(route)
				}

			} else {
				var planDates []string
				for _, info := range route.AddedDates {
					planDates = append(planDates, info.Date)
				}

				err = o.db.QueryRow(routesQuery, order.ID,
					routePos, route.User, route.Plot,
					route.Quantity, route.Issued, route.StartTime, route.EndTime, route.PauseTime, route.ErrorTime,
					route.ErrorMsg, route.DayQuantity, route.TheorEnd, route.DynEnd, route.PlanDate, route.PlanStart,
					route.PlanFaster, route.PlanExcludeDays, route.LastComment, strings.Join(planDates, ", "),
					route.Planned, route.IssuedToday, route.Time, route.Up, route.Adjustment, route.NeedShifts, route.Shift, route.AlertColor, timeOfModify).Scan(&routeID)
				route.RouteID = strconv.Itoa(routeID)
				if err != nil {
					log.Err(err).Caller().Msg("ERROR")
				}

				if len(route.AddedDates) > 0 {
					o.planningPG.CreatePlanningObject(route, order, order.ID, routePos, routeID, false)
					//log.Info().Msgf("ID IS %v ; ERROR IS %v", planningId, err)
				}

				planQuery := fmt.Sprintf(`
					INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
							 VALUES ($1, $2, $3, $4, $5, $6)
				`)

			datesLoop2:
				for _, info := range route.AddedDates {
					checkPlanDate, _ := time.Parse(layout, info.Date)
					checkToday, _ := time.Parse(layout, today)

					if route.EndTime != "" {
						log.Info().Msgf("comepleted %v / %v", order.ID, route.Plot)

						if checkPlanDate.Unix() > checkToday.Unix() {
							continue datesLoop2
						}
					}

					if checkPlanDate.Unix() >= checkToday.Unix() {
						_, err := o.db.Exec(planQuery, routeID, order.ID, route.Plot, info.Date, info.DateInfo.Divider, strings.Join(info.DateInfo.Queues, ", "))
						if err != nil {
							log.Err(err).Caller().Msg("ERROR")
						}
					}

					//var issuedToday string
					//if today == info.Date {
					//	issuedToday = route.IssuedToday
					//} else {
					//	issuedToday = "0"
					//}

					reportQuery := fmt.Sprintf(`
						INSERT INTO reports
									 (report_date, order_id, order_number, order_client, 
									  order_name, quantity, issued, plan, 
									  operator, issued_plan, order_material, order_plot, 
									  adding_date, route_position, route_id, order_timestamp,
									  shift, need_shifts)
						VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
						RETURNING report_id
					`)

					if checkPlanDate.Unix() >= checkToday.Unix() {
						var dayQuantity string
						if strings.Contains(route.DayQuantity, "/") {
							dayQuantity = strings.Split(route.DayQuantity, "/")[0]
						} else {
							dayQuantity = route.DayQuantity
						}

						var reportID int
						err = o.db.QueryRow(
							reportQuery, info.Date, order.ID, order.Number, order.Client,
							order.Name, route.Quantity, route.Issued, dayQuantity,
							"", "", order.Material, route.Plot,
							today, routePos, routeID, route.TheorEnd, route.Shift, route.NeedShifts,
						).Scan(&reportID)
						log.Info().Msgf("ADD REPORT %v", reportID)
						if err != nil {
							log.Err(err).Caller().Msg("ERROR")
						}
					}
				}

				reportQuery := fmt.Sprintf(`
					INSERT INTO reports
								 (report_date, order_id, order_number, order_client, 
									order_name, quantity, issued, plan, 
									operator, issued_plan, order_material, order_plot, 
									adding_date, route_position, route_id, order_timestamp,
									shift, need_shifts, not_planned, adjustment)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
					RETURNING report_id
				`)

				routeReports := GetIssuedReports(route)

				var keys []string
				for reportDate := range routeReports.ReportsData {
					keys = append(keys, reportDate)
				}
				sort.Strings(keys)

				//log.Info().Interface("RESULT REPORTS", routeReports).Msg("REPORTS!!!")
				//log.Info().Msgf("order id %v / report route id %v / report route plot %v", order.ID, routeReports.RouteID, routeReports.RoutePlot)

				var issuedThisTurn int
				var prevIssued int
				counter := 0
				//canRemoveRoute := true
				for _, reportDate := range keys {
					reportIssued := routeReports.ReportsData[reportDate]
					changerDate, _ := time.Parse(layout, reportDate)
					issuedThisTurn += reportIssued.Issued
					prevIssued = reportIssued.Issued

					if issuedThisTurn < 0 {
						issuedThisTurn = 0
					}

					var shift string
					if reportIssued.Last {
						shift = "Последняя"
					}

					//log.Info().Interface("report", routeReports.ReportsData[reportDate]).Msg("sorted report!")
					log.Info().Caller().Msgf("report date %v / report issued %v / report adjustment %v / report last %v", changerDate, reportIssued.Issued, reportIssued.Adjustment, shift)

					var checkID int
					if err = o.db.Get(&checkID, `SELECT report_id FROM reports WHERE report_date = $1 AND route_id = $2`, changerDate, route.RouteID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}

					if checkID == 0 {
						var reportID int
						if err = o.db.QueryRow(
							reportQuery, changerDate, order.ID, order.Number, order.Client,
							order.Name, route.Quantity, issuedThisTurn, route.DayQuantity,
							reportIssued.Operator, reportIssued.Issued, order.Material, route.Plot, today,
							routePos, routeID, order.TimeStamp, shift, route.NeedShifts, true, reportIssued.Adjustment,
						).Scan(&reportID); err != nil {
							log.Err(err).Caller().Msg("error is")
						}
						log.Info().Caller().Msgf("new report for date %v with id %v", changerDate, route.RouteID)
					}

					var reports []domain.Report
					err := o.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeReports.RouteID)
					if err != nil {
						log.Err(err).Caller().Msg("error is")
					}

					updateReportInfoQuery := fmt.Sprintf(`
						UPDATE reports
							 SET quantity = $1, need_shifts = $2, plan = $3, order_timestamp = $4, hidden_shift = $5,
							     order_number = $6, order_client = $7, order_name = $8
						 WHERE report_id = $9
					`)

					for i, report := range reports {
						oldReportDate, _ := time.Parse(layout, strings.Split(report.ReportDate, "T")[0])

						//log.Info().Caller().Msgf("day quantity %v", dayQuantity)
						if _, err := o.db.Exec(updateReportInfoQuery, route.Quantity, route.NeedShifts,
							route.DayQuantity, route.TheorEnd, i+1, order.Number,
							order.Client, order.Name, report.ReportID,
						); err != nil {
							log.Err(err).Caller().Msg("error is")
						}

						//if i >= route.NeedShifts {
						//	if _, err := o.db.Exec("UPDATE reports SET prev_total = $1 WHERE report_id = $2", issuedThisTurn-prevIssued, report.ReportID); err != nil {
						//		log.Err(err).Caller().Msg("error is")
						//	}
						//}

						if changerDate.Unix() == oldReportDate.Unix() {
							counter += 1

							if _, err := o.db.Exec(`
								UPDATE reports SET issued = $1, issued_plan = $2, operator = $3, current_shift = $4, shift = $5, adjustment = $6, need_shifts = $7, prev_total = $8 WHERE report_id = $9
								`, issuedThisTurn, reportIssued.Issued, reportIssued.Operator, counter, shift, reportIssued.Adjustment, route.NeedShifts, issuedThisTurn-prevIssued, report.ReportID); err != nil {
								log.Err(err).Caller().Msg("error is")
							}
						}
						//if i >= route.NeedShifts {
						//	if _, err := o.db.Exec("UPDATE reports SET prev_total = $1 WHERE report_id = $2", issuedThisTurn-prevIssued, report.ReportID); err != nil {
						//		log.Err(err).Caller().Msg("error is")
						//	}
						//}
					}
				}

				var reports []domain.Report
				if err = o.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeID); err != nil {
					log.Err(err).Msgf("error is")
				}

				var prevTotal, totalForPlan string
				var shift, hiddenShift int
				checkTheor := false
				for i, report := range reports {
					theorAdjustment := ""
					hiddenShift = report.HiddenShift

					if i == len(reports)-2 {
						totalForPlan = report.Issued
					}

					if report.CurrentShift != 0 {
						shift = report.CurrentShift

						//log.Info().Msgf("i %v", i)
						if i != 0 {
							totalForPlan = reports[i-1].Issued
						} else {
							totalForPlan = ""
						}
						//log.Info().Msgf("total %v", totalForPlan)

						if report.CurrentShift == 1 && !checkTheor {
							theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
							checkTheor = true
						}
					} else if !checkTheor {
						theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
						//checkTheor = true
					}

					if _, err := o.db.Exec("UPDATE reports SET prev_total = $1, theor_adjustment = $2  WHERE report_id = $3", prevTotal, theorAdjustment, report.ReportID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}

					prevTotal = report.Issued
					//log.Info().Msgf("hidden shift %v / shift %v / theor adj %v / adj %v", hiddenShift, shift, theorAdjustment, route.Adjustment)
				}

				if hiddenShift >= shift {
					shift -= 1
					if shift < 0 {
						shift = 0
					}
				}

				if checkTheor {
					if _, err = o.db.Exec("UPDATE reports SET theor_adjustment = $1 WHERE current_shift < 1 AND route_id = $2", "", routeID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}
				}

				if _, err = o.db.Exec("UPDATE planning SET shift = $1, order_issued = $2 WHERE route_id = $3", shift, totalForPlan, routeID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				//if !onlyOneFlag {
				//	if len(keys) > 0 {
				//		order.CanRemove = "no"
				//		onlyOneFlag = true
				//	}
				//
				//	if len(route.StartTime) > 0 {
				//		order.CanRemove = "no"
				//		onlyOneFlag = true
				//	}
				//
				//	if len(route.AddedDates) > 0 {
				//		order.CanRemove = "no"
				//		onlyOneFlag = true
				//	}
				//
				//	if len(route.ErrorTime) > 0 {
				//		order.CanRemove = "no"
				//		onlyOneFlag = true
				//	}
				//
				//	if len(route.PauseTime) > 0 {
				//		order.CanRemove = "no"
				//		onlyOneFlag = true
				//	}
				//}

				dateReportInfo := &DateTimeInfo{}
				_, err = o.db.Exec("DELETE FROM route_comments WHERE route_id = $1", routeID)
				for _, comment := range route.Comments {
					if len(comment.Date) > 0 {
						o.timeReportsPG.CreateTimeData(dateReportInfo, comment)
						_, err = o.db.Exec(routeCommentsQuery, routeID, comment.Date, comment.Value)
					}
				}

				resultReportTimeInfo := o.timeReportsPG.CalcTimeDataForReports(dateReportInfo)
				resultReportTimeInfo.RouteID = routeID
				resultReportTimeInfo.RoutePlot = route.Plot
				resultReportTimeInfo.FullTime = resultReportTimeInfo.BeforeStart + resultReportTimeInfo.FromStartToEnd + resultReportTimeInfo.ErrorsTime + resultReportTimeInfo.PausesTime

				if _, err := o.db.Exec("DELETE FROM time_reports WHERE route_id = $1", routeID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				reportTimeQuery := fmt.Sprintf(`
					INSERT INTO time_reports (route_id, route_plot, before_start, from_start_to_end, error, paused, full_time)
					     VALUES ($1, $2, $3, $4, $5, $6, $7)
				`)

				if _, err := o.db.Exec(reportTimeQuery, routeID, route.Plot,
					resultReportTimeInfo.BeforeStart.String(), resultReportTimeInfo.FromStartToEnd.String(),
					resultReportTimeInfo.ErrorsTime.String(), resultReportTimeInfo.PausesTime.String(), resultReportTimeInfo.FullTime.String()); err != nil {
					log.Err(err).Caller().Msg("error is")
				}
			}
		}

		_, err = o.db.Exec("UPDATE orders SET can_remove = $1 WHERE order_id = $2", order.CanRemove, order.ID)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	return err
}

func (o *OrdersPG) AddOrders(orders []*domain.Order) error {
	orderQuery := fmt.Sprintf(`
			INSERT INTO orders
						 (order_number,order_sample,order_client,order_name,
						 order_material, order_quantity, order_issued, order_m, order_endtime, order_otk, order_p, time_of_modify, can_remove)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
			RETURNING order_id
	`)

	fileQuery := fmt.Sprintf(`
	  INSERT INTO files
						(file_name, order_id)
		 VALUES ($1, $2)
	`)

	getFilesQuery := fmt.Sprintf(`
		SELECT file_name FROM files WHERE order_id = $1
	`)

	commentsQuery := fmt.Sprintf(`
		INSERT INTO comments (comment_text, order_id)
		VALUES ($1, $2)	
	`)

	routesQuery := fmt.Sprintf(`
			INSERT INTO routes (order_id, route_position, worker, plot_id, quantity,
													issued, start_time, end_time, pause_time, pause_value, error_time, 
													error_value, day_quantity, theor_end, dyn_end, plan_date, 
													plan_start, plan_faster, plan_exclude_days, last_comment, 
			                    plan_dates, planned, issued_plan, time, up, adjustment, need_shifts, shift, alert_color, time_of_creation)
						 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
			RETURNING route_id
		`)

	routeCommentsQuery := fmt.Sprintf(`
			INSERT INTO route_comments (route_id, date, value) VALUES ($1, $2, $3)
	`)

	var files []string

	layout := "2006-01-02"
	loc, _ := time.LoadLocation("Europe/Moscow")
	today := time.Now().In(loc).Format(layout)

	var err error
	var id string
	for _, order := range orders {
		timeOfModify := time.Now().In(loc).Format("2006-01-02 15:04:05")

		if order.EndTime != "" {
			err = o.db.QueryRow(orderQuery, order.Number, order.Sample, order.Client,
				order.Name, order.Material, order.Quantity, order.Issued, order.M, order.EndTime, order.OTK, order.P, timeOfModify, "yes").Scan(&id)
		} else {
			err = o.db.QueryRow(orderQuery, order.Number, order.Sample, order.Client,
				order.Name, order.Material, order.Quantity, order.Issued, order.M, nil, order.OTK, order.P, timeOfModify, "yes").Scan(&id)
		}

		err = o.db.Select(&files, getFilesQuery, id)
		for _, file := range order.Files {
			if file != "" && !o.findFile(files, file) {
				_, err = o.db.Exec(fileQuery, file, id)
			}
		}

		for _, comment := range order.Comments {
			if comment != "" {
				_, err = o.db.Exec(commentsQuery, comment, id)
			}
		}

		var routeID int
		onlyOneFlag := false
		//routesLoop:
		for name, route := range order.Routes {
			//if !route.IsUpdated {
			//	continue routesLoop
			//}

			routePos := strings.Split(name, "-")[1]
			//log.Info().Msgf("route %v / theor end %v", route.Plot, route.TheorEnd)

			var planDates []string
			for _, info := range route.AddedDates {
				planDates = append(planDates, info.Date)
			}

			//log.Info().Interface("route", route).Msgf("route is")

			err = o.db.QueryRow(routesQuery, id,
				routePos, route.User, route.Plot,
				route.Quantity, route.Issued, route.StartTime, route.PauseTime, route.PauseMsg,
				route.EndTime, route.ErrorTime, route.ErrorMsg, route.DayQuantity,
				route.TheorEnd, route.DynEnd, route.PlanDate, route.PlanStart, route.PlanFaster,
				route.PlanExcludeDays, route.LastComment, strings.Join(planDates, ", "),
				route.Planned, route.IssuedToday, route.Time, route.Up, route.Adjustment,
				route.NeedShifts, route.Shift, route.AlertColor, timeOfModify).Scan(&routeID)

			planQuery := fmt.Sprintf(`
				INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
						 VALUES ($1, $2, $3, $4, $5, $6)
			`)

		datesLoop:
			for _, info := range route.AddedDates {
				checkPlanDate, _ := time.Parse(layout, info.Date)
				checkToday, _ := time.Parse(layout, today)

				if route.EndTime != "" {
					continue datesLoop
				}

				_, err := o.db.Exec(planQuery, routeID, id, route.Plot, info.Date, info.DateInfo.Divider, strings.Join(info.DateInfo.Queues, ", "))
				if err != nil {
					log.Err(err).Caller().Msg("ERROR")
				}

				reportQuery := fmt.Sprintf(`
					INSERT INTO reports 
								 (report_date, order_id, order_number, order_client, order_name, quantity, issued, plan, operator, issued_plan, order_material, order_plot, adding_date, route_position, route_id, order_timestamp)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
					RETURNING report_id
				`)

				if checkPlanDate.Unix() >= checkToday.Unix() {
					var dayQuantity string
					if strings.Contains(route.DayQuantity, "/") {
						dayQuantity = strings.Split(route.DayQuantity, "/")[0]
					} else {
						dayQuantity = route.DayQuantity
					}

					var reportID int
					err = o.db.QueryRow(
						reportQuery, info.Date, id, order.Number, order.Client,
						order.Name, route.Quantity, route.Issued, dayQuantity,
						route.User, "", order.Material, route.Plot, today, routePos, routeID, today,
					).Scan(&reportID)
					log.Info().Msgf("ADD REPORT %v", reportID)
					if err != nil {
						log.Err(err).Caller().Msg("ERROR")
					}
				}
			}

			reportQuery := fmt.Sprintf(`
				INSERT INTO reports
							 (report_date, order_id, order_number, order_client, 
								order_name, quantity, issued, plan, 
								operator, issued_plan, order_material, order_plot, 
								adding_date, route_position, route_id, order_timestamp,
								shift, need_shifts)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
				RETURNING report_id
			`)

			routeReports := GetIssuedReports(route)

			var keys []string
			for reportDate := range routeReports.ReportsData {
				keys = append(keys, reportDate)
			}
			sort.Strings(keys)

			//log.Info().Interface("RESULT REPORTS", routeReports).Msg("REPORTS!!!")
			//log.Info().Msgf("order id %v / report route id %v / report route plot %v", id, routeID, routeReports.RoutePlot)

			var issuedThisTurn int
			for _, reportDate := range keys {
				reportIssued := routeReports.ReportsData[reportDate]
				changerDate, _ := time.Parse(layout, reportDate)
				issuedThisTurn += reportIssued.Issued
				//log.Info().Caller().Msgf("total issued %v", issuedThisTurn)

				if issuedThisTurn < 0 {
					issuedThisTurn = 0
				}

				var shift string
				if reportIssued.Last {
					shift = "Последняя"
				}

				//log.Info().Interface("report", routeReports.ReportsData[reportDate]).Msg("sorted report!")
				log.Info().Caller().Msgf("report date %v / report issued %v / report adjustment %v / report last %v", changerDate, reportIssued.Issued, reportIssued.Adjustment, shift)

				var checkID int
				if err = o.db.Get(&checkID, `SELECT report_id FROM reports WHERE report_date = $1 AND route_id = $2`, changerDate, route.RouteID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				if checkID == 0 {
					var reportID int
					if err = o.db.QueryRow(
						reportQuery, changerDate, order.ID, order.Number, order.Client,
						order.Name, route.Quantity, issuedThisTurn, route.DayQuantity,
						reportIssued.Operator, reportIssued.Issued, order.Material, route.Plot, today,
						routePos, routeID, route.TheorEnd, shift, route.NeedShifts, true,
					).Scan(&reportID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}
					log.Info().Caller().Msgf("new report for date %v with id %v", changerDate, route.RouteID)
				}

				var reports []domain.Report
				err := o.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeReports.RouteID)
				if err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				//var totalIssued int
				for i, report := range reports {
					oldReportDate, _ := time.Parse(layout, strings.Split(report.ReportDate, "T")[0])

					if changerDate.Unix() == oldReportDate.Unix() {
						log.Info().Msgf("index is %v", i+1)

						if _, err := o.db.Exec(`
									UPDATE reports SET issued = $1, issued_plan = $2, operator = $3, current_shift = $4, shift = $5, adjustment = $6, need_shifts = $7 WHERE report_id = $8
								`, issuedThisTurn, reportIssued.Issued, reportIssued.Operator, i+1, shift, reportIssued.Adjustment, route.NeedShifts, report.ReportID); err != nil {
							log.Err(err).Msg("error is")
						}
					}
				}
			}

			var reports []domain.Report
			if err = o.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeID); err != nil {
				log.Err(err).Msgf("error is")
			}

			var prevTotal, totalForPlan string
			var shift, hiddenShift int
			checkTheor := false
			for i, report := range reports {
				theorAdjustment := ""
				hiddenShift = report.HiddenShift

				if i == len(reports)-2 {
					totalForPlan = report.Issued
				}

				if report.CurrentShift != 0 {
					shift = report.CurrentShift

					//log.Info().Msgf("i %v", i)
					if i != 0 {
						totalForPlan = reports[i-1].Issued
					} else {
						totalForPlan = ""
					}
					//log.Info().Msgf("total %v", totalForPlan)

					if report.CurrentShift == 1 && !checkTheor {
						theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
						checkTheor = true
					}
				} else if !checkTheor {
					theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
					//checkTheor = true
				}

				if _, err := o.db.Exec("UPDATE reports SET prev_total = $1, theor_adjustment = $2  WHERE report_id = $3", prevTotal, theorAdjustment, report.ReportID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				prevTotal = report.Issued
				//log.Info().Msgf("hidden shift %v / shift %v / theor adj %v / adj %v", hiddenShift, shift, theorAdjustment, route.Adjustment)
			}

			if hiddenShift >= shift {
				shift -= 1
				if shift < 0 {
					shift = 0
				}
			}

			if checkTheor {
				if _, err = o.db.Exec("UPDATE reports SET theor_adjustment = $1 WHERE current_shift < 1 AND route_id = $2", "", routeID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}
			}

			if _, err = o.db.Exec("UPDATE planning SET shift = $1, order_issued = $2 WHERE route_id = $3", shift, totalForPlan, routeID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			//_, err = o.db.Exec("UPDATE planning SET shift = $1 WHERE route_id = $2", counter, routeID)
			//if err != nil {
			//	log.Err(err).Caller().Msg("error is")
			//}

			if !onlyOneFlag {
				//canRemove := true

				if len(keys) > 0 {
					order.CanRemove = "no"
					onlyOneFlag = true
				}

				if len(route.StartTime) > 0 {
					order.CanRemove = "no"
					onlyOneFlag = true
				}

				if len(route.AddedDates) > 0 {
					order.CanRemove = "no"
					onlyOneFlag = true
				}

				if len(route.ErrorTime) > 0 {
					order.CanRemove = "no"
					onlyOneFlag = true
				}

				if len(route.PauseTime) > 0 {
					order.CanRemove = "no"
					onlyOneFlag = true
				}
			}

			dateReportInfo := &DateTimeInfo{}
			_, err = o.db.Exec("DELETE FROM route_comments WHERE route_id = $1", routeID)
			for _, comment := range route.Comments {
				if len(comment.Date) > 0 {
					o.timeReportsPG.CreateTimeData(dateReportInfo, comment)
					_, err = o.db.Exec(routeCommentsQuery, routeID, comment.Date, comment.Value)
				}
			}

			resultReportTimeInfo := o.timeReportsPG.CalcTimeDataForReports(dateReportInfo)
			resultReportTimeInfo.RouteID = routeID
			resultReportTimeInfo.RoutePlot = route.Plot
			resultReportTimeInfo.FullTime = resultReportTimeInfo.BeforeStart + resultReportTimeInfo.FromStartToEnd + resultReportTimeInfo.ErrorsTime + resultReportTimeInfo.PausesTime

			if _, err := o.db.Exec("DELETE FROM time_reports WHERE route_id = $1", routeID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			reportTimeQuery := fmt.Sprintf(`
					INSERT INTO time_reports (route_id, route_plot, before_start, from_start_to_end, error, paused, full_time)
					     VALUES ($1, $2, $3, $4, $5, $6, $7)
				`)

			if _, err := o.db.Exec(reportTimeQuery, routeID, route.Plot,
				resultReportTimeInfo.BeforeStart.String(), resultReportTimeInfo.FromStartToEnd.String(),
				resultReportTimeInfo.ErrorsTime.String(), resultReportTimeInfo.PausesTime.String(), resultReportTimeInfo.FullTime.String()); err != nil {
				log.Err(err).Caller().Msg("error is")
			}
		}

		_, err = o.db.Exec("UPDATE orders SET can_remove = $1 WHERE order_id = $2", order.CanRemove, id)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}
	return err
}

func (o *OrdersPG) findFile(files []string, file string) bool {
	for _, f := range files {
		if f == file {
			return true
		}
	}

	return false
}

func (o *OrdersPG) DeleteOrderByID(id int) error {
	_, err := o.db.Exec("DELETE FROM orders WHERE order_id = $1", id)
	return err
}

//func (o *OrdersPG) GetOrders(params domain.GetOrder) ([]*domain.Order, error) {
//	log.Info().Msgf("Getting orders, %v", params.Old)
//
//	var query string
//	if params.Old {
//		query = fmt.Sprintf(`
//			SELECT * FROM orders
//       WHERE completed = true
// 						 AND order_endtime >= $1
//						 AND order_endtime <= $2
//		   ORDER BY order_endtime ASC;
//		`)
//	} else if params.Planning {
//
//	} else {
//		query = fmt.Sprintf(`
//			SELECT * FROM orders WHERE completed = false ORDER BY order_id ASC;
//		`)
//	}
//
//	if params.UpdateOnly {
//		query = fmt.Sprintf(`
//			SELECT *
//			  FROM orders
//-- 			 WHERE completed = false
//			 	 WHERE time_of_modify > $1
//			   AND time_of_modify >= $2
//		   ORDER BY order_id ASC;
//		`)
//	}
//
//	queryFiles := fmt.Sprintf(`
//		SELECT file_name FROM files WHERE order_id = $1
//	`)
//
//	queryComments := fmt.Sprintf(`
//		SELECT comment_text FROM comments WHERE order_id = $1
//	`)
//
//	queryRoutes := fmt.Sprintf(`
//		SELECT *
//	   FROM routes
//	  WHERE order_id = $1
//	`)
//
//	//queryRouteBusyPlan := fmt.Sprintf(`
//	//	SELECT plan_date, divider, queues
//	//	  FROM plans
//	//   WHERE route_plot = $1 AND plan_date >= $2 AND route_id != $3
//	//	 ORDER BY plan_date
//	//`)
//
//	var err error
//	var orders []*domain.Order
//
//	if params.Old {
//		err = o.db.Select(&orders, query, params.ArchiveFrom, params.ArchiveTo)
//		if err != nil {
//			log.Err(err).Caller().Msg("error is")
//		}
//
//	} else if params.Planning {
//
//	} else if params.UpdateOnly {
//		if len(params.UpdateTime) > 0 {
//			err = o.db.Select(&orders, query, params.UpdateTime, params.StartTime)
//			if err != nil {
//				log.Err(err).Caller().Msg("error is")
//			}
//		} else {
//			err = o.db.Select(&orders, query, params.StartTime, params.StartTime)
//			if err != nil {
//				log.Err(err).Caller().Msg("error is")
//			}
//		}
//	} else {
//		err = o.db.Select(&orders, query)
//		if err != nil {
//			log.Err(err).Caller().Msg("error is")
//		}
//	}
//
//	for _, order := range orders {
//		err = o.db.Select(&order.Files, queryFiles, order.ID)
//		if err != nil {
//			log.Err(err).Caller().Msg("error is")
//		}
//		err = o.db.Select(&order.Comments, queryComments, order.ID)
//		if err != nil {
//			log.Err(err).Caller().Msg("error is")
//		}
//		err = o.db.Select(&order.DbRoutes, queryRoutes, order.ID)
//		if err != nil {
//			log.Err(err).Caller().Msg("error is")
//		}
//		//log.Info().Caller().Interface("order", order).Msgf("order")
//
//		for _, route := range order.DbRoutes {
//			//log.Info().Caller().Interface("route", route).Msgf("route")
//			//chanRoute := make(chan *domain.Route)
//			//routeID := route.RouteID
//
//			go o.getRouteSubInfo(*route)
//
//			//order.DbRoutes[i] = <-chanRoute
//			//log.Info().Caller().Interface("route", order.DbRoutes[i]).Msg("route")
//		}
//	}
//
//	log.Info().Msgf("Returning orders, %v", params.Old)
//	return orders, err
//}

func (o *OrdersPG) getRouteSubInfo(route domain.Route) {
	//var route *domain.Route
	routeID := route.RouteID
	today := time.Now().Format("2006-01-02")

	queryRouteComments := fmt.Sprintf(`
		SELECT date, value
		  FROM route_comments
		 WHERE route_id = $1
     ORDER BY comment_id
	`)

	queryRouteIssuedToday := fmt.Sprintf(`
		SELECT issued_plan
	   FROM reports
	  WHERE route_id = $1 AND report_date = $2
	`)

	queryRoutePlan := fmt.Sprintf(`
		SELECT plan_date, divider, queues
		  FROM plans
     WHERE route_id = $1
--      AND plan_date >= $2
		 ORDER BY plan_date
	`)

	queryRouteTimeReports := fmt.Sprintf(`
		SELECT * FROM time_reports WHERE route_id = $1
	`)

	var err error
	err = o.db.Select(&route.Comments, queryRouteComments, routeID)
	if err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	o.db.Get(&route.IssuedToday, queryRouteIssuedToday, routeID, today)

	err = o.db.Select(&route.DBPlanDates, queryRoutePlan, routeID)
	if err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	for _, dateInfo := range route.DBPlanDates {
		var newAdded domain.DateInfo

		newAdded.Date = dateInfo.PlanDate
		newAdded.DateInfo.Divider = dateInfo.Divider
		newAdded.DateInfo.Queues = strings.Split(dateInfo.Queues, ", ")

		route.AddedDates = append(route.AddedDates, newAdded)
	}

	if err := o.db.Get(&route.TimeReportsInfo, queryRouteTimeReports, routeID); err != nil {
		//log.Err(err).Caller().Msg("error is")
	}
}

func (o *OrdersPG) GetOrders(params domain.GetOrder) ([]*domain.Order, error) {
	//log.Info().Msgf("Getting orders, %v", params.Old)

	var query string
	if params.Old {
		query = fmt.Sprintf(`
			SELECT * FROM orders
      WHERE completed = true
						 AND order_endtime >= $1
						 AND order_endtime <= $2
		   ORDER BY order_endtime ASC;
		`)
	} else if params.Planning {

	} else {
		var clientName string
		if params.IsClient {
			clientName = fmt.Sprintf(`AND order_client = '%s'`, params.ClientName)
		}

		query = fmt.Sprintf(`
			SELECT * FROM orders WHERE completed = false %s ORDER BY order_id ASC;
		`, clientName)

	}

	if params.UpdateOnly {
		query = fmt.Sprintf(`
			SELECT *
			  FROM orders
-- 			 WHERE completed = false
			 	 WHERE time_of_modify > $1
			   AND time_of_modify >= $2
		   ORDER BY order_id ASC;
		`)
	}

	queryFiles := fmt.Sprintf(`
			SELECT file_name FROM files WHERE order_id = $1
		`)
	//
	queryComments := fmt.Sprintf(`
			SELECT comment_text FROM comments WHERE order_id = $1
		`)
	//
	queryRoutes := fmt.Sprintf(`
			SELECT *
		   FROM routes
		  WHERE order_id = $1
		`)
	//
	//	queryRouteComments := fmt.Sprintf(`
	//		SELECT date, value
	//		  FROM route_comments
	//		 WHERE route_id = $1
	//    ORDER BY comment_id
	//	`)
	//
	//	queryRouteIssuedToday := fmt.Sprintf(`
	//		SELECT issued_plan
	//	   FROM reports
	//	  WHERE route_id = $1 AND report_date = $2
	//	`)
	//
	//	queryRoutePlan := fmt.Sprintf(`
	//		SELECT plan_date, divider, queues
	//		  FROM plans
	//    WHERE route_id = $1
	//--      AND plan_date >= $2
	//		 ORDER BY plan_date
	//	`)
	//
	//	queryRouteTimeReports := fmt.Sprintf(`
	//		SELECT * FROM time_reports WHERE route_id = $1
	//	`)

	//queryRouteBusyPlan := fmt.Sprintf(`
	//	SELECT plan_date, divider, queues
	//	  FROM plans
	//   WHERE route_plot = $1 AND plan_date >= $2 AND route_id != $3
	//	 ORDER BY plan_date
	//`)

	var err error
	var orders []*domain.Order

	if params.Old {
		err = o.db.Select(&orders, query, params.ArchiveFrom, params.ArchiveTo)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}

	} else if params.Planning {

	} else if params.UpdateOnly {
		if len(params.UpdateTime) > 0 {
			err = o.db.Select(&orders, query, params.UpdateTime, params.StartTime)
			if err != nil {
				log.Err(err).Caller().Msg("error is")
			}
		} else {
			err = o.db.Select(&orders, query, params.StartTime, params.StartTime)
			if err != nil {
				log.Err(err).Caller().Msg("error is")
			}
		}
	} else {
		err = o.db.Select(&orders, query)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	//today := time.Now().Format("2006-01-02")
	//check := make(chan bool)
	for _, order := range orders {
		//go o.getOrderSubInfo(order, queryFiles, queryComments, queryRoutes, queryRouteComments, queryRouteIssued, &err, check)
		//fmt.Println(<-check)

		err = o.db.Select(&order.Files, queryFiles, order.ID)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
		err = o.db.Select(&order.Comments, queryComments, order.ID)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
		err = o.db.Select(&order.DbRoutes, queryRoutes, order.ID)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}

		//log.Info().Msgf("getting routes")
		//for _, route := range order.DbRoutes {
		//	err = o.db.Select(&route.Comments, queryRouteComments, route.RouteID)
		//	if err != nil {
		//		log.Err(err).Caller().Msg("error is")
		//	}
		//
		//	o.db.Get(&route.IssuedToday, queryRouteIssuedToday, route.RouteID, today)
		//
		//	err = o.db.Select(&route.DBPlanDates, queryRoutePlan, route.RouteID)
		//	if err != nil {
		//		log.Err(err).Caller().Msg("error is")
		//	}
		//
		//	for _, dateInfo := range route.DBPlanDates {
		//		var newAdded domain.DateInfo
		//
		//		newAdded.Date = dateInfo.PlanDate
		//		newAdded.DateInfo.Divider = dateInfo.Divider
		//		newAdded.DateInfo.Queues = strings.Split(dateInfo.Queues, ", ")
		//
		//		route.AddedDates = append(route.AddedDates, newAdded)
		//	}
		//
		//	if err := o.db.Get(&route.TimeReportsInfo, queryRouteTimeReports, route.RouteID); err != nil {
		//		//log.Err(err).Caller().Msg("error is")
		//	}
		//
		//	//err = o.db.Select(&route.BusyDates, queryRouteBusyPlan, route.Plot, today, route.RouteID)
		//	//if err != nil {
		//	//	log.Err(err).Caller().Msg("error is")
		//	//}
		//}
	}
	//log.Info().Msgf("returning routes")

	//log.Info().Msg("RETURNING orders")
	return orders, err
}

type ReportsIssued struct {
	RouteID     string
	RoutePlot   string
	ReportsData map[string]ReportIssuedInfo
}

type ReportIssuedInfo struct {
	Issued     int
	Adjustment int
	Plot       string
	Operator   string
	Last       bool
}

func GetIssuedReports(route *domain.Route) ReportsIssued {
	reportsIssued := ReportsIssued{
		RouteID:     "",
		RoutePlot:   "",
		ReportsData: map[string]ReportIssuedInfo{},
	}

	for _, comment := range route.Comments {
		if strings.Contains(comment.Date, "REPORTMSG") {
			fixedReport := strings.TrimSpace(strings.ReplaceAll(comment.Date, "REPORTMSG", ""))
			splittedReport := strings.Split(fixedReport, "__")
			splittedReport[0] = strings.ReplaceAll(splittedReport[0], ".", "-")

			//log.Info().Interface("report", splittedReport).Msgf("splitted report is")
			//log.Info().Msgf("len of splitted report %v", len(splittedReport))

			var last bool
			if len(splittedReport) >= 5 {
				if splittedReport[4] == "last" {
					last = true
				} else {
					last = false
				}
			}

			var intAdjustment int
			//var err error
			if len(splittedReport) == 6 {
				if splittedReport[5] != "" {
					//if intAdjustment, err = strconv.Atoi(splittedReport[5]); err != nil {
					//	intAdjustment = -1
					//}

					intAdjustment, _ = strconv.Atoi(splittedReport[5])
				} else {
					intAdjustment = -1
				}
			}

			var intIssued int
			if splittedReport[3] != "" {
				intIssued, _ = strconv.Atoi(splittedReport[3])
			} else {
				intIssued = -1
			}

			if reportsIssued.ReportsData[splittedReport[0]].Issued == -1 {
				intIssued += 1
			}

			if reportsIssued.ReportsData[splittedReport[0]].Adjustment == -1 {
				intAdjustment += 1
			}

			reportsIssued.ReportsData[splittedReport[0]] = ReportIssuedInfo{
				Issued:     reportsIssued.ReportsData[splittedReport[0]].Issued + intIssued,
				Adjustment: reportsIssued.ReportsData[splittedReport[0]].Adjustment + intAdjustment,
				Plot:       splittedReport[2],
				Operator:   splittedReport[1],
				Last:       last,
			}

			reportsIssued.RouteID = route.RouteID
			reportsIssued.RoutePlot = route.Plot
		}
	}

	return reportsIssued
}

func getIssuedForDay(day string, route domain.Route) ([]string, int) {
	var issuedLog []string
	var sumForToday int
	for _, comment := range route.Comments {
		if strings.Contains(comment.Date, "REPORTMSG") {
			fixedReport := strings.TrimSpace(strings.ReplaceAll(comment.Date, "REPORTMSG", ""))
			//log.Info().Interface("report", fixedReport).Msgf("report is")
			splittedReport := strings.Split(fixedReport, "__")

			if strings.ReplaceAll(splittedReport[0], ".", "-") == day {
				intIssued, _ := strconv.Atoi(splittedReport[len(splittedReport)-1])
				sumForToday += intIssued
				issuedLog = append(issuedLog, splittedReport[len(splittedReport)-1])
				log.Info().Interface("report for today", splittedReport).Msgf("report for today")
			}
		}
	}

	return issuedLog, sumForToday
}

func (o *OrdersPG) getOrderSubInfo(order *domain.Order, queryFiles, queryComments, queryRoutes, queryRouteComments, queryRouteIssued string, outErr *error, check chan bool) {
	err := o.db.Select(&order.Files, queryFiles, order.ID)
	err = o.db.Select(&order.Comments, queryComments, order.ID)
	err = o.db.Select(&order.DbRoutes, queryRoutes, order.ID)
	for _, route := range order.DbRoutes {
		err = o.db.Select(&route.Comments, queryRouteComments, route.RouteID)
	}
	log.Info().Interface("order", order.ID).Msg("check order")

	check <- true
	*outErr = err
}

func NewOrdersPG(db *sqlx.DB, reportsPg *ReportsPG, planningPG *PlanningPG, timeReportsPG *TimeReportsPG) *OrdersPG {
	return &OrdersPG{db: db, reportsPG: reportsPg, planningPG: planningPG, timeReportsPG: timeReportsPG}
}

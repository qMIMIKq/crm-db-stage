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

type RoutesPG struct {
	db         *sqlx.DB
	reportsPG  *ReportsPG
	planningPG *PlanningPG
}

func (r *RoutesPG) DeleteRoute(routeID string) error {
	deleteRouteQuery := fmt.Sprintf(`
		 DELETE FROM routes WHERE route_id = $1
	`)

	_, err := r.db.Exec(deleteRouteQuery, routeID)
	return err
}

func (r *RoutesPG) GetRouteByID(id int) *domain.Route {
	var route domain.Route

	routeQuery := fmt.Sprintf(`
		SELECT * FROM routes WHERE route_id = $1
	`)

	commentQuery := fmt.Sprintf(`
		SELECT date, value FROM route_comments WHERE route_id = $1
	`)

	queryRoutePlan := fmt.Sprintf(`
		SELECT plan_date, divider, queues
		  FROM plans
     WHERE route_id = $1
--      AND plan_date >= $2
		 ORDER BY plan_date
	`)

	if err := r.db.Get(&route, routeQuery, id); err != nil {
		log.Err(err).Caller().Msgf("error is")
	}

	if err := r.db.Select(&route.Comments, commentQuery, id); err != nil {
		log.Err(err).Caller().Msgf("error is")
	}

	if err := r.db.Select(&route.DBPlanDates, queryRoutePlan, route.RouteID); err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	for _, dateInfo := range route.DBPlanDates {
		var newAdded domain.DateInfo

		newAdded.Date = dateInfo.PlanDate
		newAdded.DateInfo.Divider = dateInfo.Divider
		newAdded.DateInfo.Queues = strings.Split(dateInfo.Queues, ", ")

		route.AddedDates = append(route.AddedDates, newAdded)
	}

	return &route
}

func (r *RoutesPG) UpdateRoute(route *domain.Route) error {
	layout := "2006-01-02"
	loc, _ := time.LoadLocation("Europe/Moscow")
	today := time.Now().In(loc).Format(layout)
	timeOfModify := time.Now().In(loc).Format("2006-01-02 15:04:05")
	canRemove := "yes"

	onlyOneFlag := false
	err := r.reportsPG.RemoveForUpdateReports(route.OrderID)

	routesUpdateQuery := fmt.Sprintf(`
		UPDATE routes SET worker = $1, plot_id = $2, quantity = $3,
					 issued = $4, start_time = $5, end_time = $6,
					 pause_time = $7, pause_value = $8, error_time = $9, error_value = $10, day_quantity = $11,
					 theor_end = $12, dyn_end = $13, plan_date = $14, plan_start = $15,
					 plan_faster = $16, plan_exclude_days = $17, last_comment = $18, plan_dates = $19,
					 planned = $20, issued_plan = $21, time = $22, up = $23, adjustment = $24, need_shifts = $25, shift = $26
-- 		WHERE order_id = $27 AND route_position = $28
		WHERE route_id = $27 
		RETURNING route_id
	`)

	var planDates []string
	for _, info := range route.AddedDates {
		planDates = append(planDates, info.Date)
	}

	var routeID int
	err = r.db.QueryRow(routesUpdateQuery, route.User, route.Plot,
		route.Quantity, route.Issued, route.StartTime, route.EndTime,
		route.PauseTime, route.PauseMsg, route.ErrorTime, route.ErrorMsg, route.DayQuantity,
		route.TheorEnd, route.DynEnd, route.PlanDate, route.PlanStart, route.PlanFaster,
		route.PlanExcludeDays, route.LastComment, strings.Join(planDates, ", "),
		route.Planned, route.IssuedToday, route.Time, route.Up, route.Adjustment, route.NeedShifts, route.Shift,
		route.RouteID).Scan(&routeID)

	if err != nil {
		log.Err(err).Caller().Msg("Error")
	}

	log.Info().Caller().Msgf("order id %v", route.OrderID)

	var order domain.Order
	if err := r.db.Get(&order, `SELECT * FROM orders WHERE order_id = $1`, route.OrderID); err != nil {
		log.Err(err).Caller().Msg("Error")
	}

	if len(route.AddedDates) > 0 {
		r.planningPG.CreatePlanningObject(route, &order, order.ID, route.RoutePosition, routeID, false)
	}

	planQuery := fmt.Sprintf(`
		INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
				 VALUES ($1, $2, $3, $4, $5, $6)
	`)

	//_, err =r.db.Exec("DELETE FROM plans WHERE route_id = $1", dbRoutePos[0].RouteID)
	_, err = r.db.Exec("DELETE FROM plans WHERE route_id = $1 AND plan_date >= $2", routeID, today)

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
			_, err := r.db.Exec(planQuery, routeID, order.ID, route.Plot, info.Date, info.DateInfo.Divider, strings.Join(info.DateInfo.Queues, ", "))
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
			err = r.db.QueryRow(
				reportQuery, info.Date, order.ID, order.Number, order.Client,
				order.Name, route.Quantity, issued, dayQuantity,
				"", "", order.Material, route.Plot, today,
				route.RoutePosition, routeID, route.TheorEnd, route.Shift, route.NeedShifts,
			).Scan(&reportID)
			if err != nil {
				log.Err(err).Caller().Msg("ERROR")
			}
		}
	}

	routeCommentsQuery := fmt.Sprintf(`
			INSERT INTO route_comments (route_id, date, value) VALUES ($1, $2, $3)
		`)

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
		if err = r.db.Get(&checkID, `SELECT report_id FROM reports WHERE report_date = $1 AND route_id = $2`, changerDate, route.RouteID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}

		if checkID == 0 {
			var reportID int
			if err = r.db.QueryRow(
				reportQuery, changerDate, order.ID, order.Number, order.Client,
				order.Name, route.Quantity, issuedThisTurn, route.DayQuantity,
				reportIssued.Operator, reportIssued.Issued, order.Material, route.Plot, today,
				route.RoutePosition, routeID, route.TheorEnd, shift, route.NeedShifts, true, reportIssued.Adjustment,
			).Scan(&reportID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}
			log.Info().Caller().Msgf("new report for date %v with id %v", changerDate, route.RouteID)
		}

		var reports []domain.Report
		err := r.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeReports.RouteID)
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
			if _, err := r.db.Exec(updateReportInfoQuery, route.Quantity, route.NeedShifts,
				route.DayQuantity, route.TheorEnd, i+1, order.Number,
				order.Client, order.Name, report.ReportID,
			); err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			//if i >= route.NeedShifts {
			//	if _, err :=r.db.Exec("UPDATE reports SET prev_total = $1 WHERE report_id = $2", issuedThisTurn-prevIssued, report.ReportID); err != nil {
			//		log.Err(err).Caller().Msg("error is")
			//	}
			//}

			if changerDate.Unix() == oldReportDate.Unix() {
				counter += 1

				if _, err := r.db.Exec(`
								UPDATE reports SET issued = $1, issued_plan = $2, operator = $3, current_shift = $4, shift = $5, adjustment = $6, need_shifts = $7, prev_total = $8 WHERE report_id = $9
								`, issuedThisTurn, reportIssued.Issued, reportIssued.Operator, counter, shift, reportIssued.Adjustment, route.NeedShifts, issuedThisTurn-prevIssued, report.ReportID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}
			}
		}
	}

	var reports []domain.Report
	if err = r.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeID); err != nil {
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

			if report.CurrentShift == 1 && !checkTheor {
				theorAdjustment = strconv.Itoa(route.Adjustment)
				checkTheor = true
			}
		} else if !checkTheor {
			theorAdjustment = strconv.Itoa(route.Adjustment)
			//checkTheor = true
		}

		if _, err := r.db.Exec("UPDATE reports SET prev_total = $1, theor_adjustment = $2  WHERE report_id = $3", prevTotal, theorAdjustment, report.ReportID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}

		prevTotal = report.Issued
		//log.Info().Msgf("hidden shift %v / shift %v / theor adj %v / adj %v", hiddenShift, shift, theorAdjustment, route.Adjustment)
	}

	if hiddenShift >= shift && shift != 1 {
		shift -= 1
		if shift < 0 {
			shift = 0
		}
	}

	if checkTheor {
		if _, err = r.db.Exec("UPDATE reports SET theor_adjustment = $1 WHERE current_shift < 1 AND route_id = $2", "", routeID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	if _, err = r.db.Exec("UPDATE planning SET shift = $1, order_issued = $2 WHERE route_id = $3", shift, totalForPlan, routeID); err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	if !onlyOneFlag {
		if len(keys) > 0 {
			canRemove = "no"
			onlyOneFlag = true
		}

		if len(route.StartTime) > 0 {
			canRemove = "no"
			onlyOneFlag = true
		}

		if len(route.AddedDates) > 0 {
			canRemove = "no"
			onlyOneFlag = true
		}

		if len(route.ErrorTime) > 0 {
			canRemove = "no"
			onlyOneFlag = true
		}

		if len(route.PauseTime) > 0 {
			canRemove = "no"
			onlyOneFlag = true
		}
	}

	_, err = r.db.Exec("DELETE FROM route_comments WHERE route_id = $1", routeID)
	for _, comment := range route.Comments {
		if len(comment.Date) > 0 {
			_, err = r.db.Exec(routeCommentsQuery, routeID, comment.Date, comment.Value)
		}
	}

	_, err = r.db.Exec("UPDATE orders SET can_remove = $1, time_of_modify = $2 WHERE order_id = $3", canRemove, timeOfModify, order.ID)
	if err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	//log.Info().Caller().Interface("route", route).Msg("route is")

	return nil
}

func NewRoutesPG(db *sqlx.DB, reportsPG *ReportsPG, planningPG *PlanningPG) *RoutesPG {
	return &RoutesPG{db: db, reportsPG: reportsPG, planningPG: planningPG}
}

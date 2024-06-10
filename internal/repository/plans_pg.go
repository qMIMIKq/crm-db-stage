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

type PlansPG struct {
	db        *sqlx.DB
	reportsPG *ReportsPG
}

func (p *PlansPG) AutoShiftPlan(shift *domain.PlanShift) error {
	dateLayout := "2006-01-02"

	var planDates []*domain.DbPlanInfo
	queryRoutePlan := fmt.Sprintf(`
		SELECT plan_date, divider, queues, route_id, route_plot, order_id
		  FROM plans
     WHERE route_id != $1
       AND route_plot = $2
       AND plan_date > $3
		 ORDER BY plan_date
	`)

	startForRemove := shift.LastDate
	planRoutes := map[string][]*domain.DbPlanInfo{}

	err := p.db.Select(&planDates, queryRoutePlan, shift.RouteID, shift.RoutePlot, shift.LastDate)
	if err != nil {
		return err
	}

	for _, plan := range planDates {
		planRoutes[plan.RouteID] = append(planRoutes[plan.RouteID], plan)
	}

	deleteQuery := fmt.Sprintf(`
		DELETE FROM plans
		 WHERE route_id = $1
			 AND plan_date >= $2
	`)

	planQuery := fmt.Sprintf(`
		INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
		VALUES ($1, $2, $3, $4, $5, $6)
	`)

	_, err = p.db.Exec(deleteQuery, shift.RouteID, startForRemove)
	for i := 0; i < shift.Shifts; i++ {
		var newDate time.Time
		res, _ := time.Parse(dateLayout, strings.Split(shift.LastDate, "T")[0])
		if i != 0 {
			newDate = res.Add(24 * time.Hour)
		} else {
			newDate = res
		}

		stringDate := newDate.Format(dateLayout)
		shift.LastDate = stringDate
		if _, err = p.db.Exec(planQuery, shift.RouteID, shift.OrderID, shift.RoutePlot, stringDate, 1, 1); err != nil {
			log.Err(err).Msg("error is")
		}

	}

	lastDate, _ := time.Parse(dateLayout, strings.Split(shift.LastDate, "T")[0])
	for id := range planRoutes {
		_, err = p.db.Exec(deleteQuery, id, startForRemove)
		//log.Info().Caller().Interface("plan", plans).Msgf("plan for id %v", id)
	}

	for _, plan := range planDates {
		planDate, _ := time.Parse(dateLayout, strings.Split(plan.PlanDate, "T")[0])

		var dateForQuery string
		if lastDate.Unix() >= planDate.Unix() {
			lastDate = lastDate.Add(24 * time.Hour)
			dateForQuery = lastDate.Format(dateLayout)
		} else {
			dateForQuery = planDate.Format(dateLayout)
		}

		_, err = p.db.Exec(planQuery, plan.RouteID, plan.OrderID, plan.RoutePlot, dateForQuery, plan.Divider, plan.Queues)
	}

	var shiftCheck []string
	shiftQuery := fmt.Sprintf(`
		SELECT plan_date
		  FROM plans
		 WHERE route_id = $1
	`)

	err = p.db.Select(&shiftCheck, shiftQuery, shift.RouteID)
	for i, check := range shiftCheck {
		shiftCheck[i] = strings.Split(check, "T")[0]
	}

	var routesInfo []*domain.Route
	var routeInfo domain.Route

	queryRoutes := fmt.Sprintf(`
		SELECT *
	  FROM routes
	 WHERE route_id = $1
	`)

	queryRouteComments := fmt.Sprintf(`
		SELECT date, value
		  FROM route_comments
		 WHERE route_id = $1
     ORDER BY comment_id
	`)

	err = p.db.Get(&routeInfo, queryRoutes, shift.RouteID)
	routeInfo.PlanDates = strings.Join(shiftCheck, ", ")
	routesInfo = append(routesInfo, &routeInfo)

	for route, plans := range planRoutes {
		var routeInfo domain.Route
		err = p.db.Get(&routeInfo, queryRoutes, route)

		var planDates []string
		for _, plan := range plans {
			planDates = append(planDates, plan.PlanDate)
		}

		routeInfo.PlanDates = strings.Join(planDates, ", ")
		routesInfo = append(routesInfo, &routeInfo)
	}

	routePlanQuery := fmt.Sprintf(`
		UPDATE routes 
       SET plan_dates = $1
		WHERE route_id = $2
  `)

	deleteReportsQuery := fmt.Sprintf(`
		DELETE FROM reports WHERE route_id = $1 AND report_date >= $2
	`)

	loc, _ := time.LoadLocation("Europe/Moscow")
	timeOfModify := time.Now().In(loc).Format("2006-01-02 15:04:05")
	orderModifyQuery := fmt.Sprintf(`
		UPDATE orders SET time_of_modify = $1 WHERE order_id = $2
	`)

	orderQuery := fmt.Sprintf(`
		SELECT * FROM orders WHERE order_id = $1
	`)

	layout := "2006-01-02"
	today := time.Now().In(loc).Format(layout)
	timeToday, _ := time.Parse(dateLayout, today)

	var order domain.Order
	for _, route := range routesInfo {
		if _, err := p.db.Exec(deleteReportsQuery, route.RouteID, startForRemove); err != nil {
			return err
		}
		if _, err := p.db.Exec(routePlanQuery, route.PlanDates, route.RouteID); err != nil {
			return err
		}
		if err := p.db.Select(&route.Comments, queryRouteComments, route.RouteID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
		if _, err := p.db.Exec(orderModifyQuery, timeOfModify, route.OrderID); err != nil {
			return err
		}
		if err := p.db.Get(&order, orderQuery, route.OrderID); err != nil {
			log.Err(err).Msgf("error is")
			return err
		}

		log.Info().Interface("comments", route.Comments).Msgf("route %v / id %v / order id %v", route.Plot, route.RouteID, route.OrderID)

		for _, date := range strings.Split(route.PlanDates, ", ") {
			log.Info().Caller().Msgf("date %v", date)
			reportQuery := fmt.Sprintf(`
				INSERT INTO reports
							 (report_date, order_id, order_number, order_client, 
								order_name, quantity, issued, plan, 
								operator, issued_plan, order_material, order_plot, 
								adding_date, route_position, route_id, order_timestamp,
								shift, need_shifts, not_planned)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
				RETURNING report_id
			`)

			checkDate, _ := time.Parse(dateLayout, strings.Split(date, "T")[0])
			log.Info().Msgf("check date %v / today date %v", checkDate, timeToday)
			if checkDate.Unix() >= timeToday.Unix() {
				err = p.db.QueryRow(
					reportQuery, date, route.OrderID, order.Number, order.Client, order.Name, route.Quantity, route.Issued,
					route.DayQuantity, "", "", order.Material, route.Plot, today, route.RoutePosition, route.RouteID,
					order.TimeStamp, "", route.NeedShifts, false,
				).Err()
				if err != nil {
					return err
				}
			}
		}

		fmt.Println("")
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

	for _, route := range routesInfo {
		routeReports := GetIssuedReports(route)
		if err := p.db.Get(&order, orderQuery, route.OrderID); err != nil {
			log.Err(err).Msgf("error is")
			return err
		}

		var keys []string
		for reportDate := range routeReports.ReportsData {
			keys = append(keys, reportDate)
		}
		sort.Strings(keys)

		var issuedThisTurn int
		var prevIssued int
		counter := 0
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
			if err = p.db.Get(&checkID, `SELECT report_id FROM reports WHERE report_date = $1 AND route_id = $2`, changerDate, route.RouteID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			if checkID == 0 {
				var reportID int
				if err = p.db.QueryRow(
					reportQuery, changerDate, order.ID, order.Number, order.Client,
					order.Name, route.Quantity, issuedThisTurn, route.DayQuantity,
					reportIssued.Operator, reportIssued.Issued, order.Material, route.Plot, today,
					route.RoutePosition, route.RouteID, order.TimeStamp, shift, route.NeedShifts, true, reportIssued.Adjustment,
				).Scan(&reportID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}
				log.Info().Caller().Msgf("new report for date %v with id %v", changerDate, route.RouteID)
			}

			var reports []domain.Report
			err := p.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeReports.RouteID)
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
				if _, err := p.db.Exec(updateReportInfoQuery, route.Quantity, route.NeedShifts,
					route.DayQuantity, route.TheorEnd, i+1, order.Number,
					order.Client, order.Name, report.ReportID,
				); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				if changerDate.Unix() == oldReportDate.Unix() {
					counter += 1

					if _, err := p.db.Exec(`
								UPDATE reports SET issued = $1, issued_plan = $2, operator = $3, current_shift = $4, shift = $5, adjustment = $6, need_shifts = $7, prev_total = $8 WHERE report_id = $9
								`, issuedThisTurn, reportIssued.Issued, reportIssued.Operator, counter, shift, reportIssued.Adjustment, route.NeedShifts, issuedThisTurn-prevIssued, report.ReportID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}
				}
			}
		}

		var reports []domain.Report
		if err = p.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", route.RouteID); err != nil {
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

				log.Info().Msgf("i %v", i)
				if i != 0 {
					totalForPlan = reports[i-1].Issued
				} else {
					totalForPlan = ""
				}
				log.Info().Msgf("total %v", totalForPlan)

				if report.CurrentShift == 1 && !checkTheor {
					theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
					checkTheor = true
				}
			} else if !checkTheor {
				theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
				//checkTheor = true
			}

			if _, err := p.db.Exec("UPDATE reports SET prev_total = $1, theor_adjustment = $2  WHERE report_id = $3", prevTotal, theorAdjustment, report.ReportID); err != nil {
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
			if _, err = p.db.Exec("UPDATE reports SET theor_adjustment = $1 WHERE current_shift < 1 AND route_id = $2", "", route.RouteID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}
		}

		if _, err = p.db.Exec("UPDATE planning SET shift = $1, order_issued = $2 WHERE route_id = $3", shift, totalForPlan, route.RouteID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	return nil
}

func (p *PlansPG) ShiftPlanAfterEnd(route *domain.Route) error {
	layout := "2006-01-02"
	loc, _ := time.LoadLocation("Europe/Moscow")
	today := time.Now().In(loc).Format(layout)
	timeToday, _ := time.Parse(layout, today)
	timeOfModify := time.Now().In(loc).Format("2006-01-02 15:04:05")

	dateForStart := ""
	counter := 0
	for _, info := range route.AddedDates {
		//log.Info().Caller().Msgf("info date %v", info.Date)

		if len(info.Date) > 5 {
			planDate, err := time.Parse(layout, strings.Split(info.Date, "T")[0])
			if err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			if planDate.Unix() >= timeToday.Unix() {
				counter++
				if dateForStart == "" {
					dateForStart = strings.Split(info.Date, "T")[0]
				}
			}
		}
	}

	if counter-1 <= 0 {
		return nil
	}

	log.Info().Msgf("start shifting")

	startDate, _ := time.Parse(layout, dateForStart)
	startDate = startDate.Add(-24 * time.Hour)
	startDateString := startDate.Format(layout)

	queryRoutePlan := fmt.Sprintf(`
		SELECT plan_id, plan_date, divider, queues, route_id, route_plot, order_id
		  FROM plans
     WHERE route_id != $1
       AND route_plot = $2
       AND plan_date > $3
		 ORDER BY plan_date
	`)

	var anotherPlans []*domain.DbPlanInfo
	if err := p.db.Select(&anotherPlans, queryRoutePlan, route.RouteID, route.Plot, startDateString); err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	updatePlanQuery := fmt.Sprintf(`
		INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
		VALUES ($1, $2, $3, $4, $5, $6)
	`)

	deletePlanQuery := fmt.Sprintf(`
		DELETE FROM plans WHERE route_id = $1 AND plan_date >= $2
	`)

	deleteReportsQuery := fmt.Sprintf(`
		DELETE FROM reports WHERE route_id = $1 AND report_date >= $2
	`)

	for _, plan := range anotherPlans {
		if _, err := p.db.Exec(deletePlanQuery, plan.RouteID, dateForStart); err != nil {
			log.Err(err).Caller().Msg("error is")
		}

		if _, err := p.db.Exec(deleteReportsQuery, plan.RouteID, dateForStart); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	planRoutes := map[string][]*domain.DbPlanInfo{}
	for i, plan := range anotherPlans {
		log.Info().Caller().Interface("plan", plan).Msgf("another plan with i %v is", i)
		checkForMove, err := time.Parse(layout, strings.Split(plan.PlanDate, "T")[0])
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
		moveFor := -24 * (counter - 1)
		//log.Info().Caller().Msgf("move for %v / %v", moveFor, time.Duration(moveFor))
		checkForMove = checkForMove.Add(time.Duration(moveFor) * time.Hour)

		//log.Info().Msgf("check for move %v", checkForMove)

		anotherPlans[i].PlanDate = checkForMove.Format(layout)
		planRoutes[plan.RouteID] = append(planRoutes[plan.RouteID], plan)

		if _, err := p.db.Exec(updatePlanQuery, plan.RouteID, plan.OrderID, plan.RoutePlot,
			anotherPlans[i].PlanDate, plan.Divider, plan.Queues); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	orderModifyQuery := fmt.Sprintf(`
		UPDATE orders SET time_of_modify = $1 WHERE order_id = $2
	`)

	orderQuery := fmt.Sprintf(`
		SELECT * FROM orders WHERE order_id = $1
	`)

	queryRoutes := fmt.Sprintf(`
		SELECT *
	  FROM routes
	 WHERE route_id = $1
	`)

	queryRouteComments := fmt.Sprintf(`
		SELECT date, value
		  FROM route_comments
		 WHERE route_id = $1
	  ORDER BY comment_id
	`)

	var routesInfo []*domain.Route
	for route, plan := range planRoutes {
		log.Info().Caller().Interface("plan", plan).Msgf("new another plan with route id %v is", route)
		for route, plans := range planRoutes {
			var routeInfo domain.Route
			if err := p.db.Get(&routeInfo, queryRoutes, route); err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			var planDates []string
			for _, plan := range plans {
				planDates = append(planDates, plan.PlanDate)
			}

			//if _, err := p.db.Exec(updatePlanQuery, routeInfo.RouteID, routeInfo.OrderID, routeInfo.Plot); err != nil {
			//	log.Err(err).Caller().Msg("error is")
			//}

			routeInfo.PlanDates = strings.Join(planDates, ", ")
			log.Info().Caller().Interface("plan dates", routeInfo.PlanDates).Msg("plan dates")
			routesInfo = append(routesInfo, &routeInfo)
		}
	}

	routePlanQuery := fmt.Sprintf(`
		UPDATE routes
	    SET plan_dates = $1
		WHERE route_id = $2
	`)

	var order domain.Order
	for _, route := range routesInfo {
		if _, err := p.db.Exec(deleteReportsQuery, route.RouteID, dateForStart); err != nil {
			return err
		}
		if _, err := p.db.Exec(routePlanQuery, route.PlanDates, route.RouteID); err != nil {
			return err
		}
		if err := p.db.Select(&route.Comments, queryRouteComments, route.RouteID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
		if _, err := p.db.Exec(orderModifyQuery, timeOfModify, route.OrderID); err != nil {
			return err
		}
		if err := p.db.Get(&order, orderQuery, route.OrderID); err != nil {
			log.Err(err).Msgf("error is")
			return err
		}

		log.Info().Interface("comments", route.Comments).Msgf("route %v / id %v / order id %v", route.Plot, route.RouteID, route.OrderID)

		for _, date := range strings.Split(route.PlanDates, ", ") {
			log.Info().Caller().Msgf("date %v", date)
			reportQuery := fmt.Sprintf(`
				INSERT INTO reports
							 (report_date, order_id, order_number, order_client,
								order_name, quantity, issued, plan,
								operator, issued_plan, order_material, order_plot,
								adding_date, route_position, route_id, order_timestamp,
								shift, need_shifts, not_planned)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
				RETURNING report_id
			`)

			checkDate, _ := time.Parse(layout, strings.Split(date, "T")[0])
			log.Info().Msgf("check date %v / today date %v", checkDate, timeToday)
			if checkDate.Unix() >= timeToday.Unix() {
				err := p.db.QueryRow(
					reportQuery, date, route.OrderID, order.Number, order.Client, order.Name, route.Quantity, route.Issued,
					route.DayQuantity, "", "", order.Material, route.Plot, today, route.RoutePosition, route.RouteID,
					order.TimeStamp, "", route.NeedShifts, false,
				).Err()
				if err != nil {
					return err
				}
			}
		}

		fmt.Println("")
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

	for _, route := range routesInfo {
		routeReports := GetIssuedReports(route)
		if err := p.db.Get(&order, orderQuery, route.OrderID); err != nil {
			log.Err(err).Msgf("error is")
			return err
		}

		var keys []string
		for reportDate := range routeReports.ReportsData {
			keys = append(keys, reportDate)
		}
		sort.Strings(keys)

		var issuedThisTurn int
		var prevIssued int
		counter := 0
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
			if err := p.db.Get(&checkID, `SELECT report_id FROM reports WHERE report_date = $1 AND route_id = $2`, changerDate, route.RouteID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			if checkID == 0 {
				var reportID int
				if err := p.db.QueryRow(
					reportQuery, changerDate, order.ID, order.Number, order.Client,
					order.Name, route.Quantity, issuedThisTurn, route.DayQuantity,
					reportIssued.Operator, reportIssued.Issued, order.Material, route.Plot, today,
					route.RoutePosition, route.RouteID, order.TimeStamp, shift, route.NeedShifts, true, reportIssued.Adjustment,
				).Scan(&reportID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}
				log.Info().Caller().Msgf("new report for date %v with id %v", changerDate, route.RouteID)
			}

			var reports []domain.Report
			err := p.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeReports.RouteID)
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
				if _, err := p.db.Exec(updateReportInfoQuery, route.Quantity, route.NeedShifts,
					route.DayQuantity, route.TheorEnd, i+1, order.Number,
					order.Client, order.Name, report.ReportID,
				); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				if changerDate.Unix() == oldReportDate.Unix() {
					counter += 1

					if _, err := p.db.Exec(`
								UPDATE reports SET issued = $1, issued_plan = $2, operator = $3, current_shift = $4, shift = $5, adjustment = $6, need_shifts = $7, prev_total = $8 WHERE report_id = $9
								`, issuedThisTurn, reportIssued.Issued, reportIssued.Operator, counter, shift, reportIssued.Adjustment, route.NeedShifts, issuedThisTurn-prevIssued, report.ReportID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}
				}
			}
		}

		var reports []domain.Report
		if err := p.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", route.RouteID); err != nil {
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

				log.Info().Msgf("i %v", i)
				if i != 0 {
					totalForPlan = reports[i-1].Issued
				} else {
					totalForPlan = ""
				}
				log.Info().Msgf("total %v", totalForPlan)

				if report.CurrentShift == 1 && !checkTheor {
					theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
					checkTheor = true
				}
			} else if !checkTheor {
				theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
				//checkTheor = true
			}

			if _, err := p.db.Exec("UPDATE reports SET prev_total = $1, theor_adjustment = $2  WHERE report_id = $3", prevTotal, theorAdjustment, report.ReportID); err != nil {
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
			if _, err := p.db.Exec("UPDATE reports SET theor_adjustment = $1 WHERE current_shift < 1 AND route_id = $2", "", route.RouteID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}
		}

		if _, err := p.db.Exec("UPDATE planning SET shift = $1, order_issued = $2 WHERE route_id = $3", shift, totalForPlan, route.RouteID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	return nil
}

func (p *PlansPG) ShiftPlan(shift *domain.PlanShift) error {
	dateLayout := "2006-01-02"

	var planDates []*domain.DbPlanInfo
	queryRoutePlan := fmt.Sprintf(`
		SELECT plan_date, divider, queues, route_id, route_plot, order_id
		  FROM plans
     WHERE route_id != $1
       AND route_plot = $2
       AND plan_date > $3
		 ORDER BY plan_date
	`)

	planRoutes := map[string][]*domain.DbPlanInfo{}
	//routesLastDates := map[string]*domain.DbPlanInfo{}

	err := p.db.Select(&planDates, queryRoutePlan, shift.RouteID, shift.RoutePlot, shift.LastDate)
	if err != nil {
		return err
	}

	for _, plan := range planDates {
		planRoutes[plan.RouteID] = append(planRoutes[plan.RouteID], plan)
	}

	deleteQuery := fmt.Sprintf(`
		DELETE FROM plans
		 WHERE route_id = $1
			 AND plan_date >= $2
	`)

	planQuery := fmt.Sprintf(`
		INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
		VALUES ($1, $2, $3, $4, $5, $6)
	`)

	queryRoutes := fmt.Sprintf(`
		SELECT *
	  FROM routes
	 WHERE route_id = $1
	`)

	var routesInfo []*domain.Route
	var routeInfo domain.Route

	for i := 0; i < shift.Shifts; i++ {
		for route, plans := range planRoutes {
			_, err = p.db.Exec(deleteQuery, route, shift.LastDate)
			for _, plan := range plans {
				res, _ := time.Parse("2006-01-02", strings.Split(plan.PlanDate, "T")[0])
				newDate := res.Add(24 * time.Hour)
				stringDate := newDate.Format("2006-01-02")
				plan.PlanDate = stringDate
				_, err = p.db.Exec(planQuery, plan.RouteID, plan.OrderID, plan.RoutePlot, stringDate, plan.Divider, plan.Queues)
			}
		}

		res, _ := time.Parse("2006-01-02", strings.Split(shift.LastDate, "T")[0])
		newDate := res.Add(24 * time.Hour)
		stringDate := newDate.Format("2006-01-02")
		shift.LastDate = stringDate
		_, err = p.db.Exec(planQuery, shift.RouteID, shift.OrderID, shift.RoutePlot, stringDate, 1, 1)
	}

	var shiftCheck []string
	shiftQuery := fmt.Sprintf(`
		SELECT plan_date
		  FROM plans
		 WHERE route_id = $1
	`)

	err = p.db.Select(&shiftCheck, shiftQuery, shift.RouteID)
	log.Info().Interface("check", shiftCheck).Msg("shift check")

	for i, check := range shiftCheck {
		shiftCheck[i] = strings.Split(check, "T")[0]
	}

	err = p.db.Get(&routeInfo, queryRoutes, shift.RouteID)
	routeInfo.PlanDates = strings.Join(shiftCheck, ", ")
	routesInfo = append(routesInfo, &routeInfo)

	for route, plans := range planRoutes {
		var routeInfo domain.Route
		err = p.db.Get(&routeInfo, queryRoutes, route)

		var planDates []string
		for _, plan := range plans {
			planDates = append(planDates, plan.PlanDate)
		}

		routeInfo.PlanDates = strings.Join(planDates, ", ")
		routesInfo = append(routesInfo, &routeInfo)
	}

	routePlanQuery := fmt.Sprintf(`
		UPDATE routes 
       SET plan_dates = $1
		WHERE route_id = $2
  `)

	deleteReportsQuery := fmt.Sprintf(`
		DELETE FROM reports WHERE route_id = $1 AND report_date >= $2
	`)

	queryRouteComments := fmt.Sprintf(`
		SELECT date, value
		  FROM route_comments
		 WHERE route_id = $1
     ORDER BY comment_id
	`)

	loc, _ := time.LoadLocation("Europe/Moscow")
	timeOfModify := time.Now().In(loc).Format("2006-01-02 15:04:05")
	orderModifyQuery := fmt.Sprintf(`
		UPDATE orders SET time_of_modify = $1 WHERE order_id = $2
	`)

	orderQuery := fmt.Sprintf(`
		SELECT * FROM orders WHERE order_id = $1
	`)

	layout := "2006-01-02"
	today := time.Now().In(loc).Format(layout)
	timeToday, _ := time.Parse(dateLayout, today)

	var order domain.Order
	for _, route := range routesInfo {
		if _, err := p.db.Exec(deleteReportsQuery, route.RouteID, today); err != nil {
			return err
		}
		if _, err := p.db.Exec(routePlanQuery, route.PlanDates, route.RouteID); err != nil {
			return err
		}
		if err := p.db.Select(&route.Comments, queryRouteComments, route.RouteID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
		if _, err := p.db.Exec(orderModifyQuery, timeOfModify, route.OrderID); err != nil {
			return err
		}
		if err := p.db.Get(&order, orderQuery, route.OrderID); err != nil {
			log.Err(err).Msgf("error is")
			return err
		}

		log.Info().Interface("comments", route.Comments).Msgf("route %v / id %v / order id %v", route.Plot, route.RouteID, route.OrderID)

		for _, date := range strings.Split(route.PlanDates, ", ") {
			log.Info().Caller().Msgf("date %v", date)
			reportQuery := fmt.Sprintf(`
				INSERT INTO reports
							 (report_date, order_id, order_number, order_client, 
								order_name, quantity, issued, plan, 
								operator, issued_plan, order_material, order_plot, 
								adding_date, route_position, route_id, order_timestamp,
								shift, need_shifts, not_planned)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
				RETURNING report_id
			`)

			checkDate, _ := time.Parse(layout, strings.Split(date, "T")[0])
			log.Info().Msgf("check date %v / today date %v", checkDate, timeToday)
			if checkDate.Unix() >= timeToday.Unix() {
				err = p.db.QueryRow(
					reportQuery, date, route.OrderID, order.Number, order.Client, order.Name, route.Quantity, route.Issued,
					route.DayQuantity, "", "", order.Material, route.Plot, today, route.RoutePosition, route.RouteID,
					order.TimeStamp, "", route.NeedShifts, false,
				).Err()
				if err != nil {
					return err
				}
			}
		}

		fmt.Println("")
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

	for _, route := range routesInfo {
		routeReports := GetIssuedReports(route)
		if err := p.db.Get(&order, orderQuery, route.OrderID); err != nil {
			log.Err(err).Msgf("error is")
			return err
		}

		var keys []string
		for reportDate := range routeReports.ReportsData {
			keys = append(keys, reportDate)
		}
		sort.Strings(keys)

		var issuedThisTurn int
		var prevIssued int
		counter := 0
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
			if err = p.db.Get(&checkID, `SELECT report_id FROM reports WHERE report_date = $1 AND route_id = $2`, changerDate, route.RouteID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			if checkID == 0 {
				var reportID int
				if err = p.db.QueryRow(
					reportQuery, changerDate, order.ID, order.Number, order.Client,
					order.Name, route.Quantity, issuedThisTurn, route.DayQuantity,
					reportIssued.Operator, reportIssued.Issued, order.Material, route.Plot, today,
					route.RoutePosition, route.RouteID, order.TimeStamp, shift, route.NeedShifts, true, reportIssued.Adjustment,
				).Scan(&reportID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}
				log.Info().Caller().Msgf("new report for date %v with id %v", changerDate, route.RouteID)
			}

			var reports []domain.Report
			err := p.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeReports.RouteID)
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
				if _, err := p.db.Exec(updateReportInfoQuery, route.Quantity, route.NeedShifts,
					route.DayQuantity, route.TheorEnd, i+1, order.Number,
					order.Client, order.Name, report.ReportID,
				); err != nil {
					log.Err(err).Caller().Msg("error is")
				}

				if changerDate.Unix() == oldReportDate.Unix() {
					counter += 1

					if _, err := p.db.Exec(`
								UPDATE reports SET issued = $1, issued_plan = $2, operator = $3, current_shift = $4, shift = $5, adjustment = $6, need_shifts = $7, prev_total = $8 WHERE report_id = $9
								`, issuedThisTurn, reportIssued.Issued, reportIssued.Operator, counter, shift, reportIssued.Adjustment, route.NeedShifts, issuedThisTurn-prevIssued, report.ReportID); err != nil {
						log.Err(err).Caller().Msg("error is")
					}
				}
			}
		}

		var reports []domain.Report
		if err = p.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", route.RouteID); err != nil {
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

				log.Info().Msgf("i %v", i)
				if i != 0 {
					totalForPlan = reports[i-1].Issued
				} else {
					totalForPlan = ""
				}
				log.Info().Msgf("total %v", totalForPlan)

				if report.CurrentShift == 1 && !checkTheor {
					theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
					checkTheor = true
				}
			} else if !checkTheor {
				theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
				//checkTheor = true
			}

			if _, err := p.db.Exec("UPDATE reports SET prev_total = $1, theor_adjustment = $2  WHERE report_id = $3", prevTotal, theorAdjustment, report.ReportID); err != nil {
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
			if _, err = p.db.Exec("UPDATE reports SET theor_adjustment = $1 WHERE current_shift < 1 AND route_id = $2", "", route.RouteID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}
		}

		if _, err = p.db.Exec("UPDATE planning SET shift = $1, order_issued = $2 WHERE route_id = $3", shift, totalForPlan, route.RouteID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	return nil
}

func (p *PlansPG) GetBusy(plot, routeId string) ([]domain.DbPlanInfo, error) {
	layout := "2006-01-02"
	today := time.Now().Format(layout)

	queryRouteBusyPlan := fmt.Sprintf(`
		SELECT plan_date, divider, queues
		  FROM plans
     WHERE route_plot = $1 AND plan_date >= $2 AND route_id != $3
		 ORDER BY plan_date
	`)

	var busyDates []domain.DbPlanInfo
	err := p.db.Select(&busyDates, queryRouteBusyPlan, plot, today, routeId)
	if err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	return busyDates, err
}

type reportInfo struct {
	Quantity      string `db:"quantity"`
	Issued        string `db:"issued"`
	Worker        string `db:"worker"`
	DayQuantity   string `db:"day_quantity"`
	RoutePosition string `db:"route_position"`
	IssuedToday   string `db:"issued_today"`
}

func (p *PlansPG) UpdatePlan(data *domain.PlanData) error {
	layout := "2006-01-02"
	loc, _ := time.LoadLocation("Europe/Moscow")
	today := time.Now().In(loc).Format(layout)

	_, err := p.db.Exec("DELETE FROM plans WHERE route_id = $1 AND plan_date >= $2", data.RouteID, today)
	if err != nil {
		log.Err(err).Caller().Msg("ERROR")
		return err
	}

	planQuery := fmt.Sprintf(`
		INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
				 VALUES ($1, $2, $3, $4, $5, $6)
	`)

	routePlanQuery := fmt.Sprintf(`
		UPDATE routes 
       SET plan_dates = $1
		WHERE route_id = $2
			AND order_id = $3
			RETURNING quantity, issued, worker, day_quantity, route_position, issued_plan
  `)

	var planDates []string

	for _, dateInfo := range data.AddedDates {
		planDates = append(planDates, dateInfo.Date)
	}

	info := &reportInfo{}
	err = p.db.QueryRow(routePlanQuery, strings.Join(planDates, ", "), data.RouteID, data.OrderID).
		Scan(&info.Quantity, &info.Issued, &info.Worker, &info.DayQuantity, &info.RoutePosition, &info.IssuedToday)
	if err != nil {
		log.Err(err).Caller().Msg("ERROR")
	}

	log.Info().Interface("report info", info).Msg("REPORT INFO")

	//intId, _ := strconv.Atoi(data.RouteID)
	routeID, _ := strconv.Atoi(data.RouteID)

	p.reportsPG.RemoveForUpdateReports(routeID)
	for _, dateInfo := range data.AddedDates {
		checkPlanDate, _ := time.Parse(layout, dateInfo.Date)
		checkToday, _ := time.Parse(layout, today)

		planUnix := checkPlanDate.Unix()
		todayUnix := checkToday.Unix()

		if planUnix >= todayUnix {
			_, err := p.db.Exec(planQuery, data.RouteID, data.OrderID, data.RoutePlot, dateInfo.Date, dateInfo.DateInfo.Divider, strings.Join(dateInfo.DateInfo.Queues, ", "))
			if err != nil {
				log.Err(err).Caller().Msg("ERROR")
			}

			reportQuery := fmt.Sprintf(`
				INSERT INTO reports
							 (report_date, order_id, order_number, order_client, order_name, quantity, issued, plan, operator, issued_plan, order_material, order_plot, adding_date, route_position, route_id, order_timestamp)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
				RETURNING report_id
			`)

			var reportId int
			err = p.db.QueryRow(reportQuery, dateInfo.Date, data.OrderID, data.Number, data.Client, data.Name,
				info.Quantity, info.Issued, info.DayQuantity, "", "",
				data.Material, data.RoutePlot, today, info.RoutePosition, data.RouteID, data.Timestamp).Scan(&reportId)
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
						shift, need_shifts, not_planned)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
		RETURNING report_id
	`)

	var route domain.Route
	var order domain.Order

	queryRouteComments := fmt.Sprintf(`
		SELECT date, value
		  FROM route_comments
		 WHERE route_id = $1
     ORDER BY comment_id
	`)

	if err := p.db.Get(&route, "SELECT * FROM routes WHERE route_id = $1", data.RouteID); err != nil {
		return err
	}
	if err := p.db.Select(&route.Comments, queryRouteComments, route.RouteID); err != nil {
		log.Err(err).Caller().Msg("error is")
	}
	if err := p.db.Get(&order, "SELECT * FROM orders WHERE order_id = $1", data.OrderID); err != nil {
		return err
	}

	routeReports := GetIssuedReports(&route)

	var keys []string
	for reportDate := range routeReports.ReportsData {
		keys = append(keys, reportDate)
	}
	sort.Strings(keys)

	var issuedThisTurn int
	var prevIssued int
	counter := 0
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
		if err = p.db.Get(&checkID, `SELECT report_id FROM reports WHERE report_date = $1 AND route_id = $2`, changerDate, route.RouteID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}

		if checkID == 0 {
			var reportID int
			if err = p.db.QueryRow(
				reportQuery, changerDate, order.ID, order.Number, order.Client,
				order.Name, route.Quantity, issuedThisTurn, route.DayQuantity,
				reportIssued.Operator, reportIssued.Issued, order.Material, route.Plot, today,
				route.RoutePosition, route.RouteID, order.TimeStamp, shift, route.NeedShifts, true, reportIssued.Adjustment,
			).Scan(&reportID); err != nil {
				log.Err(err).Caller().Msg("error is")
			}
			log.Info().Caller().Msgf("new report for date %v with id %v", changerDate, route.RouteID)
		}

		var reports []domain.Report
		err := p.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", routeReports.RouteID)
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
			if _, err := p.db.Exec(updateReportInfoQuery, route.Quantity, route.NeedShifts,
				route.DayQuantity, route.TheorEnd, i+1, order.Number,
				order.Client, order.Name, report.ReportID,
			); err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			if changerDate.Unix() == oldReportDate.Unix() {
				counter += 1

				if _, err := p.db.Exec(`
								UPDATE reports SET issued = $1, issued_plan = $2, operator = $3, current_shift = $4, shift = $5, adjustment = $6, need_shifts = $7, prev_total = $8 WHERE report_id = $9
								`, issuedThisTurn, reportIssued.Issued, reportIssued.Operator, counter, shift, reportIssued.Adjustment, route.NeedShifts, issuedThisTurn-prevIssued, report.ReportID); err != nil {
					log.Err(err).Caller().Msg("error is")
				}
			}
		}
	}

	var reports []domain.Report
	if err = p.db.Select(&reports, "SELECT * FROM reports WHERE route_id = $1 ORDER BY report_date", route.RouteID); err != nil {
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

			log.Info().Msgf("i %v", i)
			if i != 0 {
				totalForPlan = reports[i-1].Issued
			} else {
				totalForPlan = ""
			}
			log.Info().Msgf("total %v", totalForPlan)

			if report.CurrentShift == 1 && !checkTheor {
				theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
				checkTheor = true
			}
		} else if !checkTheor {
			theorAdjustment = fmt.Sprintf("%v", route.Adjustment)
			//checkTheor = true
		}

		if _, err := p.db.Exec("UPDATE reports SET prev_total = $1, theor_adjustment = $2  WHERE report_id = $3", prevTotal, theorAdjustment, report.ReportID); err != nil {
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
		if _, err = p.db.Exec("UPDATE reports SET theor_adjustment = $1 WHERE current_shift < 1 AND route_id = $2", "", route.RouteID); err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	if _, err = p.db.Exec("UPDATE planning SET shift = $1, order_issued = $2 WHERE route_id = $3", shift, totalForPlan, route.RouteID); err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	return nil

}

func NewPlansPG(db *sqlx.DB, reportsPG *ReportsPG) *PlansPG {
	return &PlansPG{db: db, reportsPG: reportsPG}
}

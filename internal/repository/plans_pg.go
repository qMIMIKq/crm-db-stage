package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"strings"
	"time"
)

type PlansPG struct {
	db        *sqlx.DB
	reportsPG *ReportsPG
}

func (p PlansPG) ShiftPlan(shift *domain.PlanShift) error {
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

	loc, _ := time.LoadLocation("Europe/Moscow")
	timeOfModify := time.Now().In(loc).Format("2006-01-02 15:04:05")
	orderModifyQuery := fmt.Sprintf(`
		UPDATE orders SET time_of_modify = $1 WHERE order_id = $2
	`)

	for _, route := range routesInfo {
		log.Info().Caller().Interface("route", route).Msgf("route info is for %v order %v", route.RouteID, route.OrderID)
		if _, err := p.db.Exec(routePlanQuery, route.PlanDates, route.RouteID); err != nil {
			return err
		}

		if _, err := p.db.Exec(orderModifyQuery, timeOfModify, route.OrderID); err != nil {
			return err
		}

		fmt.Println("")
	}

	//var currentShift int
	//for route, lastDate := range routesLastDates {
	//	currentShift += 1
	//
	//	log.Info().Msgf("route %v / last date %v", route, lastDate)
	//}

	return nil
}

func NewPlansPG(db *sqlx.DB, reportsPG *ReportsPG) *PlansPG {
	return &PlansPG{db: db, reportsPG: reportsPG}
}

func (p PlansPG) GetBusy(plot, routeId string) ([]domain.DbPlanInfo, error) {
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
	Issued        string `db:"ussued"`
	Worker        string `db:"worker"`
	DayQuantity   string `db:"day_quantity"`
	RoutePosition string `db:"route_position"`
	IssuedToday   string `db:"issued_today"`
}

func (p PlansPG) UpdatePlan(data *domain.PlanData) error {
	_, err := p.db.Exec("DELETE FROM plans WHERE route_id = $1", data.RouteID)
	if err != nil {
		log.Err(err).Caller().Msg("ERROR")
		return err
	}

	layout := "2006-01-02"
	today := time.Now().Format(layout)

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

	p.reportsPG.RemoveForUpdateReports(data.OrderID)
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

			var issuedToday string
			if dateInfo.Date == today {
				issuedToday = info.IssuedToday
			} else {
				issuedToday = "0"
			}

			var reportId int
			err = p.db.QueryRow(reportQuery, dateInfo.Date, data.OrderID, data.Number, data.Client, data.Name,
				info.Quantity, info.Issued, info.DayQuantity, info.Worker, issuedToday,
				data.Material, data.RoutePlot, today, info.RoutePosition, data.RouteID, data.Timestamp).Scan(&reportId)
			if err != nil {
				log.Err(err).Caller().Msg("ERROR")
			}
		}
	}

	return nil
}

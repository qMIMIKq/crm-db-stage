package repository

import (
	"crm/internal/domain"
	"errors"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"time"
)

type ReportsPG struct {
	db *sqlx.DB
}

func (r ReportsPG) GetAll(from, to string) ([]domain.Report, error) {
	query := fmt.Sprintf(`
		SELECT * FROM reports WHERE report_date >= $1 AND report_date <= $2 ORDER BY order_id, report_date 
	`)

	var reports []domain.Report
	err := r.db.Select(&reports, query, from, to)
	//log.Info().Caller().Interface("reports", reports).Msg("REPORTS")

	return reports, err
}

func (r ReportsPG) UpdateReports(route domain.Route) error {
	//getQuery := fmt.Sprintf(`
	//	SELECT issued_plan, issued FROM reports WHERE route_id = $1 AND report_date >= 2
	//`)

	//getAllQuery := fmt.Sprintf(`
	//	SELECT * FROM reports WHERE order_id = $1 AND report_date >= $2
	//`)

	//query := fmt.Sprintf(`
	//	UPDATE reports SET
	//				 issued_plan
	//`)
	//
	//log.Info().Interface("route", route).Msg("report")
	//
	//fmt.Println(query)
	//TODO implement me
	return nil
}

func (r ReportsPG) RemoveForUpdateReports(id string) error {
	query := fmt.Sprintf(`
		DELETE FROM reports WHERE order_id = $1 AND report_date >= $2
	`)

	loc, _ := time.LoadLocation("Local")
	today := time.Now().In(loc).Format("2006-01-02")
	log.Info().Msgf("TODAY IS %v", today)

	_, err := r.db.Exec(query, id, today)
	return err
}

func (r ReportsPG) AddReports2(route *domain.Route, order *domain.Order, id, routePos string, routeID int, new bool) error {
	var reportQuery string

	if new {
		reportQuery = fmt.Sprintf(`
			INSERT INTO reports 
						 (report_date, order_id, order_number, order_client, order_name, quantity, issued, plan, operator, issued_plan, order_material, order_plot, adding_date, route_position, route_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
			RETURNING report_id
	 `)
	} else {
		reportQuery = fmt.Sprintf(`
			INSERT INTO reports 
						 (report_date, order_id, order_number, order_client, order_name, quantity, issued, plan, operator, issued_plan, order_material, order_plot, adding_date, route_position, route_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
			RETURNING report_id
	 `)
	}

	log.Info().Msgf(reportQuery)

	return errors.New("fucker)")
}

func (r ReportsPG) AddReports(route *domain.Route, order *domain.Order, id, routePos string, routeID int, new bool) error {
	//	layout := "2006-01-02"
	//	endDate, _ := time.Parse(layout, route.PlanDate)
	//
	//	var startDate time.Time
	//	if new {
	//		startDate, _ = time.Parse(layout, route.PlanStart)
	//	} else {
	//		today := time.Now().Format(layout)
	//		startDate, _ = time.Parse(layout, today)
	//	}
	//
	//	var err error
	//	today := time.Now().Format(layout)
	//datesLoop:
	//	for startDate.Unix() <= endDate.Unix() {
	//		if len(route.PlanExcludeDays) > 0 {
	//			if strings.Contains(route.PlanExcludeDays, startDate.Format(layout)) {
	//				startDate = startDate.Add(24 * time.Hour)
	//				continue datesLoop
	//			}
	//		}
	//
	//		reportQuery := fmt.Sprintf(`
	//			INSERT INTO reports
	//						 (report_date, order_id, order_number, order_client, order_name, quantity, issued, plan, operator, issued_plan, order_material, order_plot, adding_date, route_position, route_id)
	//			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	//		`)
	//
	//		var issuedToday string
	//		if today == startDate.Format(layout) {
	//			issuedToday = route.IssuedToday
	//		} else {
	//			issuedToday = "0"
	//		}
	//
	//		_, err = r.db.Exec(
	//			reportQuery, startDate, id, order.Number,
	//			order.Client, order.Name, route.Quantity, route.Issued, route.DayQuantity,
	//			route.User, issuedToday, order.Material, route.Plot, today, routePos, routeID,
	//		)
	//		if err != nil {
	//			log.Err(err).Msg("error is")
	//		}
	//		startDate = startDate.Add(24 * time.Hour)
	//	}
	//
	//	updQuery := fmt.Sprintf(`
	//		UPDATE reports
	//			 SET operator = $1, issued_plan = $2, issued = $3
	//		 WHERE route_id = $4 AND report_date = $5
	//	`)
	//
	//updNextQuery := fmt.Sprintf(`
	//	UPDATE reports
	//		 SET issued = $1
	//	 WHERE route_id = $2 AND report_date = $3
	//`)

	//getIssuedQuery := fmt.Sprintf(`
	//	SELECT issued_plan, issued FROM reports WHERE report_date = $1 AND route_id = $2
	//`)
	//
	//type OldRepData struct {
	//	Issued     int `db:"issued"`
	//	IssuedPlan int `db:"issued_plan"`
	//}

	//var oldRepData OldRepData
	//for _, report := range route.ReportChanger {
	//	reportDate, _ := time.Parse(layout, report.ReportDate)
	//	repOperDate := reportDate.Format(layout)
	//	addedIssued, _ := strconv.Atoi(report.Quantity)
	//
	//	for reportDate.Unix() <= endDate.Unix() {
	//		repStringDate := reportDate.Format(layout)
	//		fmt.Println(repStringDate)
	//
	//		err = r.db.Get(&oldRepData, getIssuedQuery, repStringDate, routeID)
	//		log.Err(err).Caller().Msg("ERROR")
	//		log.Info().Interface("old", oldRepData).Msg("OLD")
	//		newIssued := oldRepData.Issued + addedIssued
	//		newIssuedPlan := oldRepData.IssuedPlan + addedIssued
	//
	//		if repOperDate == today {
	//			//_, err = r.db.Exec(updQuery, report.OperatorName, newIssuedPlan, newIssued, routeID, repStringDate)
	//		} else if repStringDate == repOperDate {
	//			_, err = r.db.Exec(updQuery, report.OperatorName, newIssuedPlan, newIssued, routeID, repStringDate)
	//			log.Err(err).Caller().Msg("ERROR")
	//			fmt.Println("CHECK NEW OPER")
	//		} else {
	//			_, err = r.db.Exec(updQuery, route.User, oldRepData.IssuedPlan, newIssued, routeID, repStringDate)
	//			log.Err(err).Caller().Msg("ERROR")
	//		}
	//		reportDate = reportDate.Add(24 * time.Hour)
	//	}
	//
	//	log.Err(err).Msg("ERROR")
	//}

	//return err
	return nil
}

func NewReportsPG(db *sqlx.DB) *ReportsPG {
	return &ReportsPG{db: db}
}

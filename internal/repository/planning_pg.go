package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"strings"
	"time"
)

type PlanningPG struct {
	db      *sqlx.DB
	plansPG *PlansPG
}

func (p *PlanningPG) GetAllPlanning(planningRange *domain.PlanningRange) ([]*domain.Planning, error) {
	layout := "2006-01-02"
	from, _ := time.Parse(layout, planningRange.From)
	minDate := from.Add(-24 * time.Hour).Format(layout)

	planningQuery := fmt.Sprintf(`
		SELECT * FROM planning ORDER BY order_id
 `)

	var planning []*domain.Planning
	err := p.db.Select(&planning, planningQuery)

	queryRoutePlan := fmt.Sprintf(`
		SELECT plan_date, divider, queues
		  FROM plans
     WHERE route_id = $1
       AND plan_date >= $2
       AND plan_date <= $3
		 ORDER BY plan_date
	`)

	queryFiles := fmt.Sprintf(`
		SELECT file_name FROM files WHERE order_id = $1
	`)

	for i, plan := range planning {
		err = p.db.Select(&plan.DBPlanDates, queryRoutePlan, plan.RouteID, minDate, planningRange.To)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
			err = nil
		}

		err = p.db.Select(&plan.Files, queryFiles, plan.OrderID)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
			err = nil
		}

		if len(plan.DBPlanDates) > 0 {
			for _, dateInfo := range plan.DBPlanDates {
				var newAdded domain.DateInfo

				newAdded.Date = dateInfo.PlanDate
				newAdded.DateInfo.Divider = dateInfo.Divider
				newAdded.DateInfo.Queues = strings.Split(dateInfo.Queues, ", ")

				plan.AddedDates = append(plan.AddedDates, newAdded)
			}
		} else {
			planning[i] = &domain.Planning{}
		}
	}

	return planning, err
}

func (p *PlanningPG) CreatePlanningObject(route *domain.Route, order *domain.Order, id, routePos string, routeID int, new bool) (int, error) {
	checkQuery := fmt.Sprintf(`
		SELECT planning_id FROM planning WHERE order_id = $1 AND route_id = $2
  `)

	var planningID int
	err := p.db.Get(&planningID, checkQuery, id, routeID)
	if err != nil {
		log.Err(err).Msg("error getting old plan")
	}

	layout := "2006-01-02"
	loc, _ := time.LoadLocation("Europe/Moscow")
	today := time.Now().In(loc).Format(layout)

	var timestamp string
	if len(order.TimeStamp) < 3 {
		timestamp = today
	} else {
		timestamp = order.TimeStamp
	}

	if route.EndTime != "" || order.Completed {
		_, err = p.db.Exec("DELETE FROM planning WHERE planning_id = $1", planningID)
		err = p.plansPG.ShiftPlanAfterEnd(route)
		return planningID, err
	}

	if planningID == 0 {
		planningQuery := fmt.Sprintf(`
			INSERT INTO planning
						 (order_id, order_number, order_timestamp, order_client, order_name,
						  order_quantity, order_issued, time_of_modify, route_id, route_plot, need_shifts, position)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
			RETURNING planning_id
	`)

		err = p.db.QueryRow(planningQuery, id, order.Number, timestamp, order.Client, order.Name, route.Quantity, route.Issued, order.TimeOfModify, routeID, route.Plot, route.NeedShifts, routePos).Scan(&planningID)
	} else {
		planningQuery := fmt.Sprintf(`
			UPDATE planning
				 SET order_id = $1, order_number = $2, order_client = $3, order_name = $4,
						 order_quantity = $5, order_issued = $6, time_of_modify = $7, route_id = $8, route_plot = $9, need_shifts = $10, position = $11
		  WHERE planning_id = $12
			RETURNING planning_id
	`)

		err = p.db.QueryRow(planningQuery, id, order.Number, order.Client, order.Name, route.Quantity, route.Issued, order.TimeOfModify, routeID, route.Plot, route.NeedShifts, routePos, planningID).Scan(&planningID)
	}

	return planningID, err
}

func (p *PlanningPG) ShiftPlanningAfterEnd(planningID int, route *domain.Route) error {

	return nil
}

func NewPlanningPG(db *sqlx.DB, plansPG *PlansPG) *PlanningPG {
	return &PlanningPG{db: db, plansPG: plansPG}
}

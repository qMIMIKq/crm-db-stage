package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"time"
)

type PlansPG struct {
	db *sqlx.DB
}

func (p PlansPG) GetBusy(plot string) ([]domain.DbPlanInfo, error) {
	layout := "2006-01-02"
	today := time.Now().Format(layout)

	queryRouteBusyPlan := fmt.Sprintf(`
		SELECT plan_date, divider, queues
		  FROM plans
     WHERE route_plot = $1 AND plan_date >= $2 AND route_id != $3
		 ORDER BY plan_date
	`)

	var busyDates []domain.DbPlanInfo
	err := p.db.Select(&busyDates, queryRouteBusyPlan, plot, today, 0)
	if err != nil {
		log.Err(err).Caller().Msg("error is")
	}

	return busyDates, err
}

func NewPlansPG(db *sqlx.DB) *PlansPG {
	return &PlansPG{db: db}
}

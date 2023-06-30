package repository

import (
	"fmt"
	"github.com/jmoiron/sqlx"
)

type RoutesPG struct {
	db *sqlx.DB
}

func (r RoutesPG) DeleteRoute(routeID string) error {
	deleteRouteQuery := fmt.Sprintf(`
		 DELETE FROM routes WHERE route_id = $1
	`)

	_, err := r.db.Exec(deleteRouteQuery, routeID)
	return err
}

func NewRoutesPG(db *sqlx.DB) *RoutesPG {
	return &RoutesPG{db: db}
}

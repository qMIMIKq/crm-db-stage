package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
)

type FiltersPG struct {
	db *sqlx.DB
}

func (f FiltersPG) EditFilter(filter domain.FilterInfo) error {
	log.Info().Interface("filter", filter).Msg("Filter!!")

	query := fmt.Sprintf(`
			UPDATE filters
				 SET filter_name = $1, plot_id = $2,
             start_time = $3, end_time = $4, disable = $5
			 WHERE filter_id = $6
	`)

	_, err := f.db.Exec(query, filter.Name, filter.PlotID, filter.StartTime, filter.EndTime, filter.Disable, filter.ID)

	return err
}

func (f FiltersPG) GetFilters(hidden bool) ([]domain.FilterInfo, error) {
	query := fmt.Sprintf(`
			SELECT f.filter_id, f.filter_name, 
						 f.plot_id, f.disable, p.plot_name
			  FROM filters f
						 JOIN plots p USING(plot_id)
	`)

	if hidden {
		query += " ORDER BY f.disable, f.filter_id"
	} else {
		query += " ORDER BY f.position, f.filter_id"
	}

	var filters []domain.FilterInfo
	err := f.db.Select(&filters, query)

	return filters, err
}

func (f *FiltersPG) UpdatePosition(filters []domain.FilterInfo) error {
	query := fmt.Sprintf(`
			UPDATE filters
				 SET position = $1
			 WHERE filter_id = $2
	`)

	var err error
	for _, filter := range filters {
		_, err = f.db.Exec(query, filter.Position, filter.ID)
	}

	return err
}

func (f FiltersPG) CreateFilter(filter domain.FilterInfo) (int, error) {
	query := fmt.Sprintf(`
			INSERT INTO filters (filter_name, plot_id, start_time, end_time)
			VALUES ($1, $2, $3, $4)
			RETURNING filter_id
	`)

	var id int
	err := f.db.QueryRow(query, filter.Name, filter.PlotID, filter.StartTime, filter.EndTime).Scan(&id)

	return id, err
}

func (f FiltersPG) GetFilterByID(filterId string) (domain.FilterInfo, error) {
	query := fmt.Sprintf(`
		SELECT f.filter_id, f.filter_name, f.plot_id, 
           p.plot_name, f.start_time, f.disable, f.end_time
      FROM filters f
           JOIN plots p USING(plot_id)	 				
     WHERE f.filter_id = $1
	`)

	checkDeleteQuery := fmt.Sprintf(`
		SELECT r.route_id
		 FROM routes r
		 JOIN orders o USING (order_id)
		WHERE r.plot_id = $1
			AND o.completed = false
		LIMIT 1
	`)

	var filter domain.FilterInfo
	err := f.db.Get(&filter, query, filterId)

	var filterCheckID int
	f.db.Get(&filterCheckID, checkDeleteQuery, filter.Name)
	log.Info().Msgf("filter check id %v", filterCheckID)
	if filterCheckID == 0 {
		filter.CanDelete = true
	} else {
		filter.CanDelete = false
	}

	return filter, err
}

func (f *FiltersPG) DeleteFilter(filterID string) error {
	queryFilter := fmt.Sprintf(`
		DELETE FROM filters WHERE filter_id = $1
		RETURNING filter_name
	`)

	queryRoute := fmt.Sprintf(`
		DELETE FROM routes 
		 USING orders
		 WHERE plot_id = $1
		   AND routes.order_id = orders.order_id
			 AND orders.completed = false
	`)

	var filterNickname string
	err := f.db.QueryRow(queryFilter, filterID).Scan(&filterNickname)
	_, err = f.db.Exec(queryRoute, filterNickname)

	log.Info().Msgf("user nickname %s", filterNickname)

	return err
}

func NewFiltersPG(db *sqlx.DB) *FiltersPG {
	return &FiltersPG{db: db}
}

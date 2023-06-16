package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
)

type FiltersPG struct {
	db *sqlx.DB
}

func (f FiltersPG) EditFilter(filter domain.FilterInfo) error {
	query := fmt.Sprintf(`
			UPDATE filters
				 SET filter_name = $1, plot_id = $2, 
             start_time = $3, end_time = $4
			 WHERE filter_id = $5
	`)

	_, err := f.db.Exec(query, filter.Name, filter.PlotID, filter.StartTime, filter.EndTime, filter.ID)

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

func (f FiltersPG) GetFilters() ([]domain.FilterInfo, error) {
	query := fmt.Sprintf(`
			SELECT f.filter_id, f.filter_name, 
						 f.plot_id, p.plot_name
			  FROM filters f
						 JOIN plots p USING(plot_id)	 						
	`)

	var filters []domain.FilterInfo
	err := f.db.Select(&filters, query)

	return filters, err
}

func (f FiltersPG) GetFilterByID(filterId int) (domain.FilterInfo, error) {
	query := fmt.Sprintf(`
		SELECT f.filter_id, f.filter_name, f.plot_id, 
           p.plot_name, f.start_time, f.end_time
      FROM filters f
           JOIN plots p USING(plot_id)	 				
     WHERE f.filter_id = $1
	`)

	var filter domain.FilterInfo
	err := f.db.Get(&filter, query, filterId)

	return filter, err
}

func NewFiltersPG(db *sqlx.DB) *FiltersPG {
	return &FiltersPG{db: db}
}

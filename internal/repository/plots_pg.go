package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
)

type PlotsPG struct {
	db *sqlx.DB
}

func (p PlotsPG) EditPlot(plot domain.Plot) error {
	query := fmt.Sprintf(`
			UPDATE plots
				 SET plot_name = $1
			 WHERE plot_id = $2;
	`)

	_, err := p.db.Exec(query, plot.Name, plot.ID)
	return err
}

func (p PlotsPG) GetPlotByID(plotId int) (domain.Plot, error) {
	query := fmt.Sprintf(`
			SELECT * 
				FROM plots
			 WHERE plot_id = $1
	`)

	var plot domain.Plot
	err := p.db.Get(&plot, query, plotId)

	return plot, err
}

func (p PlotsPG) CreatePlot(plot domain.Plot) (int, error) {
	query := fmt.Sprintf(`
		INSERT INTO plots (plot_name)
    VALUES ($1)
		returning plot_id
  `)

	var id int
	err := p.db.QueryRow(query, plot.Name).Scan(&id)

	return id, err
}

func (p PlotsPG) GetPlots() ([]domain.Plot, error) {
	query := fmt.Sprintf(`
		SELECT * FROM plots
	`)

	var plots []domain.Plot
	err := p.db.Select(&plots, query)

	return plots, err
}

func NewPlotsPG(db *sqlx.DB) *PlotsPG {
	return &PlotsPG{db: db}
}

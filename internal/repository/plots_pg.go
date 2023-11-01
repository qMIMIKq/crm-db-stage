package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
)

type PlotsPG struct {
	db *sqlx.DB
}

func (p *PlotsPG) DeletePlot(plotID string) error {
	query := fmt.Sprintf(`
		DELETE FROM plots WHERE plot_id = $1
		RETURNING nickname
	`)

	var filterNickname string
	err := p.db.QueryRow(query, plotID).Scan(&filterNickname)

	log.Info().Msgf("user nickname %s", filterNickname)

	return err
}

func (p *PlotsPG) EditPlot(plot domain.Plot) error {
	log.Info().Interface("plot", plot).Msg("PLOT IS")

	query := fmt.Sprintf(`
			UPDATE plots
				 SET plot_name = $1,
             nickname = $2,
             disable = $3
			 WHERE plot_id = $4;
	`)

	disableFiltersQuery := fmt.Sprintf(`
		UPDATE filters
	 	   SET disable = $1
		 WHERE plot_id = $2
	`)

	_, err := p.db.Exec(query, plot.Name, plot.ShortName, plot.Disable, plot.ID)
	_, err = p.db.Exec(disableFiltersQuery, plot.Disable, plot.ID)

	return err
}

func (p *PlotsPG) GetPlotByID(plotId string) (domain.Plot, error) {
	query := fmt.Sprintf(`
			SELECT * 
				FROM plots
			 WHERE plot_id = $1
	`)

	canDeleteQuery := fmt.Sprintf(`
		SELECT filter_id FROM filters WHERE plot_id = $1
	`)

	var plot domain.Plot
	err := p.db.Get(&plot, query, plotId)

	var checkID int
	err = p.db.Get(&checkID, canDeleteQuery, plotId)
	if err != nil {
		plot.CanDelete = true
		err = nil
	} else {
		plot.CanDelete = false
	}

	return plot, err
}

func (p *PlotsPG) CreatePlot(plot domain.Plot) (int, error) {
	query := fmt.Sprintf(`
		INSERT INTO plots (plot_name, nickname)
    VALUES ($1, $2) returning plot_id
  `)

	var id int
	err := p.db.QueryRow(query, plot.Name, plot.ShortName).Scan(&id)

	return id, err
}

func (p *PlotsPG) GetPlots() ([]domain.Plot, error) {
	query := fmt.Sprintf(`
		SELECT * FROM plots
		ORDER BY disable
	`)

	var plots []domain.Plot
	err := p.db.Select(&plots, query)

	return plots, err
}

func NewPlotsPG(db *sqlx.DB) *PlotsPG {
	return &PlotsPG{db: db}
}

//
//func (p *PlotsPG) DeletePlot(plot domain.Plot) error {
//
//}

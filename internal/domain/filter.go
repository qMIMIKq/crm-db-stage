package domain

type FilterInfo struct {
	ID        int    `json:"id" db:"filter_id"`
	Name      string `json:"name" db:"filter_name"`
	PlotID    string `json:"plot_id" db:"plot_id"`
	Plot      string `json:"plot" db:"plot_name"`
	StartTime string `json:"start_time" db:"start_time"`
	EndTime   string `json:"end_time" db:"end_time"`
}

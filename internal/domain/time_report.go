package domain

type TimeReportPlot struct {
	ID                 int    `json:"id" db:"id"`
	RoutePlot          string `json:"route_plot" db:"route_plot"`
	Expectation        string `json:"expectation" db:"expectation"`
	PrevExpectation    string `json:"prev_expectation" db:"prev_expectation"`
	CurrentExpectation string `json:"current_expectation" db:"current_expectation"`
	TotalExpectation   string `json:"total_expectation" db:"total_expectation"`
	LastStart          string `json:"last_start" db:"last_start"`
	LastEnd            string `json:"last_end" db:"last_end"`
}

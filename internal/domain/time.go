package domain

type TimeInfo struct {
	Start        string `json:"start_time"`
	MachineStart string `json:"machine_start"`
	MachineEnd   string `json:"machine_end"`
	Quantity     int    `json:"quantity"`
	//DayQuantity  int    `json:"day_quantity"`
	Issued     int    `json:"issued"`
	Up         int    `json:"up" db:"up"`
	Time       string `json:"time" db:"time"`
	Adjustment int    `json:"adjustment" db:"adjustment"`
}

type TimeReportInfoDB struct {
	ID             int    `json:"id" db:"id"`
	BeforeStart    string `json:"before_start" db:"before_start"`
	FromStartToEnd string `json:"from_start_to_end" db:"from_start_to_end"`
	PausesTime     string `json:"pauses_time" db:"paused"`
	ErrorsTime     string `json:"errors_time" db:"error"`
	FullTime       string `json:"full_time" db:"full_time"`
	RouteID        int    `json:"route_id" db:"route_id"`
	RoutePlot      string `json:"route_plot" db:"route_plot"`
}

type TimeResult struct {
	TheoreticEnd string `json:"theoretic_end" db:"theoretic_end"`
	DynamicEnd   string `json:"dynamic_end" db:"dynamic_end"`
}

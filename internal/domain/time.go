package domain

type TimeInfo struct {
	Start        string  `json:"start_time"`
	MachineStart string  `json:"machine_start"`
	MachineEnd   string  `json:"machine_end"`
	Quantity     int     `json:"quantity"`
	DayQuantity  int     `json:"day_quantity"`
	Issued       int     `json:"issued"`
	Up           int     `json:"up" db:"up"`
	Time         float64 `json:"time" db:"time"`
	Adjustment   int     `json:"adjustment" db:"adjustment"`
}

type TimeResult struct {
	TheoreticEnd string `json:"theoretic_end" db:"theoretic_end"`
	DynamicEnd   string `json:"dynamic_end" db:"dynamic_end"`
}

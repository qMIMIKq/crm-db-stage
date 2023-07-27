package domain

type Route struct {
	User            string   `json:"user" db:"worker"`
	RouteID         string   `json:"route_id" db:"route_id"`
	Plot            string   `json:"plot" db:"plot_id"`
	RoutePosition   string   `json:"route_position" db:"route_position"`
	Comments        []Report `json:"comments"`
	StartTime       string   `json:"start_time" db:"start_time"`
	OtkTime         string   `json:"otk_time" db:"otk_time"`
	EndTime         string   `json:"end_time" db:"end_time"`
	ErrorTime       string   `json:"error_time" db:"error_time"`
	ErrorMsg        string   `json:"error_msg" db:"error_value"`
	Quantity        string   `json:"quantity" db:"quantity"`
	DayQuantity     string   `json:"day_quantity" db:"day_quantity"`
	Issued          string   `json:"issued" db:"issued"`
	OrderID         string   `json:"order_id" db:"order_id"`
	TheorEnd        string   `json:"theor_end" db:"theor_end"`
	DynEnd          string   `json:"dyn_end" db:"dyn_end"`
	PlanDate        string   `json:"plan_date" db:"plan_date"`
	PlanStart       string   `json:"plan_start" db:"plan_start"`
	PlanExcludeDays string   `json:"exclude_days" db:"plan_exclude_days"`
	PlanFaster      bool     `json:"plan_faster" db:"plan_faster"`
}

type Report struct {
	Date  string `json:"date"`
	Value string `json:"value"`
}

type CheckRoute struct {
	RouteID  string `db:"route_id"`
	RoutePos string `db:"route_position"`
}

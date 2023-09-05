package domain

type Route struct {
	User            string          `json:"user" db:"worker"`
	RouteID         string          `json:"route_id" db:"route_id"`
	Plot            string          `json:"plot" db:"plot_id"`
	RoutePosition   string          `json:"route_position" db:"route_position"`
	Comments        []Comment       `json:"comments"`
	LastComment     string          `json:"last_comment" db:"last_comment"`
	StartTime       string          `json:"start_time" db:"start_time"`
	EndTime         string          `json:"end_time" db:"end_time"`
	PauseTime       string          `json:"pause_time" db:"pause_time"`
	ErrorTime       string          `json:"error_time" db:"error_time"`
	ErrorMsg        string          `json:"error_msg" db:"error_value"`
	Quantity        string          `json:"quantity" db:"quantity"`
	DayQuantity     string          `json:"day_quantity" db:"day_quantity"`
	Issued          string          `json:"issued" db:"issued"`
	IssuedToday     string          `json:"issued_today" db:"issued_plan"`
	OrderID         string          `json:"order_id" db:"order_id"`
	TheorEnd        string          `json:"theor_end" db:"theor_end"`
	DynEnd          string          `json:"dyn_end" db:"dyn_end"`
	PlanDate        string          `json:"plan_date" db:"plan_date"`
	PlanStart       string          `json:"plan_start" db:"plan_start"`
	PlanExcludeDays string          `json:"exclude_days" db:"plan_exclude_days"`
	PlanFaster      bool            `json:"plan_faster" db:"plan_faster"`
	Planned         bool            `json:"planned"`
	ReportChanger   []ReportChanger `json:"report_changer"`
	AddedDates      []DateInfo      `json:"added_dates"`
	PlanDates       string          `db:"plan_dates" json:"plan_dates"`
	DBPlanDates     []DbPlanInfo    `json:"db_plan"`
	BusyDates       []DbPlanInfo    `json:"busy_dates"`
}

type DbPlanInfo struct {
	OrderID   string `json:"order_id" db:"order_id"`
	RoutePlot string `json:"route_plot" db:"route_plot"`
	PlanDate  string `json:"date" db:"plan_date"`
	Divider   string `json:"divider" db:"divider"`
	Queues    string `json:"queues" db:"queues"`
}

type DateInfo struct {
	Date     string `json:"date"`
	DateInfo Info   `json:"date_info"`
}

type Info struct {
	Divider string   `json:"divider" db:""`
	Queues  []string `json:"queues" db:""`
}

type ReportChanger struct {
	OperatorName string `json:"operator_name"`
	ReportDate   string `json:"report_date"`
	Quantity     string `json:"quantity"`
}

type Comment struct {
	Date  string `json:"date"`
	Value string `json:"value"`
}

type CheckRoute struct {
	RouteID  string `db:"route_id"`
	RoutePos string `db:"route_position"`
}
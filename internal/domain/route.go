package domain

type Route struct {
	User            string           `json:"user" db:"worker"`
	RouteID         string           `json:"route_id" db:"route_id"`
	Plot            string           `json:"plot" db:"plot_id"`
	RoutePosition   string           `json:"route_position" db:"route_position"`
	Comments        []Comment        `json:"comments"`
	LastComment     string           `json:"last_comment" db:"last_comment"`
	StartTime       string           `json:"start_time" db:"start_time"`
	EndTime         string           `json:"end_time" db:"end_time"`
	PauseTime       string           `json:"pause_time" db:"pause_time"`
	PauseMsg        string           `json:"pause_msg" db:"pause_value"`
	ErrorTime       string           `json:"error_time" db:"error_time"`
	ErrorMsg        string           `json:"error_msg" db:"error_value"`
	Quantity        string           `json:"quantity" db:"quantity"`
	DayQuantity     string           `json:"day_quantity" db:"day_quantity"`
	Issued          string           `json:"issued" db:"issued"`
	IssuedToday     string           `json:"issued_today" db:"issued_plan"`
	OrderID         string           `json:"order_id" db:"order_id"`
	TheorEnd        string           `json:"theor_end" db:"theor_end"`
	DynEnd          string           `json:"dyn_end" db:"dyn_end"`
	PlanDate        string           `json:"plan_date" db:"plan_date"`
	PlanStart       string           `json:"plan_start" db:"plan_start"`
	PlanExcludeDays string           `json:"exclude_days" db:"plan_exclude_days"`
	PlanFaster      bool             `json:"plan_faster" db:"plan_faster"`
	Planned         bool             `json:"planned" db:"planned"`
	ReportChanger   []ReportChanger  `json:"report_changer"`
	AddedDates      []DateInfo       `json:"added_dates"`
	PlanDates       string           `db:"plan_dates" json:"plan_dates"`
	DBPlanDates     []DbPlanInfo     `json:"db_plan"`
	BusyDates       []DbPlanInfo     `json:"busy_dates"`
	Up              int              `json:"up" db:"up"`
	Time            float64          `json:"time" db:"time"`
	Adjustment      int              `json:"adjustment" db:"adjustment"`
	Shift           string           `json:"shift" db:"shift"`
	NeedShifts      int              `json:"need_shifts" db:"need_shifts"`
	AlertColor      string           `json:"alert_color" db:"alert_color"`
	TimeReportsInfo TimeReportInfoDB `json:"time_reports_info"`
	TimeOfCreation  interface{}      `json:"time_of_creation" db:"time_of_creation"`
	IsUpdated       bool             `json:"is_updated" db:"is_updated"`
}

type DbPlanInfo struct {
	PlanID    string `json:"plan_id" db:"plan_id"`
	PlanDate  string `json:"date" db:"plan_date"`
	Divider   string `json:"divider" db:"divider"`
	Queues    string `json:"queues" db:"queues"`
	RouteID   string `json:"route_id" db:"route_id"`
	RoutePlot string `json:"route_plot" db:"route_plot"`
	OrderID   string `json:"order_id" db:"order_id"`
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
	Operator string `json:"operator"`
	Date     string `json:"date"`
	Quantity int    `json:"quantity"`
}

type Comment struct {
	Date  string `json:"date"`
	Value string `json:"value"`
}

type CheckRoute struct {
	RouteID  string `db:"route_id"`
	RoutePos string `db:"route_position"`
}

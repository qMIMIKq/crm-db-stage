package domain

type Report struct {
	ReportID        int         `json:"report_id" db:"report_id"`
	ReportDate      string      `json:"report_date" db:"report_date"`
	TimeStamp       interface{} `json:"timestamp" db:"order_timestamp"`
	OrderID         int         `json:"order_id" db:"order_id"`
	OrderNumber     string      `json:"order_number" db:"order_number"`
	OrderClient     string      `json:"order_client" db:"order_client"`
	OrderName       string      `json:"order_name" db:"order_name"`
	OrderMaterial   string      `json:"order_material" db:"order_material"`
	Quantity        string      `json:"quantity" db:"quantity"`
	IssuedPlan      string      `json:"issued_plan" db:"issued_plan"`
	ReportEnd       string      `json:"report_end" db:"report_end"`
	Issued          string      `json:"issued" db:"issued"`
	Adjustment      string      `json:"adjustment" db:"adjustment"`
	Plan            string      `json:"plan" db:"plan"`
	Operator        string      `json:"operator" db:"operator"`
	Plot            string      `json:"order_plot" db:"order_plot"`
	AddingDate      string      `json:"adding_date" db:"adding_date"`
	RoutePosition   string      `json:"route_position" db:"route_position"`
	RouteID         string      `json:"route_id" db:"route_id"`
	Shift           string      `json:"shift" db:"shift"`
	NeedShifts      int         `json:"need_shifts" db:"need_shifts"`
	NotPlanned      bool        `json:"not_planned" db:"not_planned"`
	CurrentShift    int         `json:"current_shift" db:"current_shift"`
	PrevTotal       string      `json:"prev_total" db:"prev_total"`
	HiddenShift     int         `json:"hidden_shift" db:"hidden_shift"`
	TheorAdjustment string      `json:"theor_adjustment" db:"theor_adjustment"`
}

type ReportTime struct {
	From       string `json:"from"`
	To         string `json:"to"`
	IsClient   bool   `json:"is_client"`
	ClientName string `json:"client_name"`
}

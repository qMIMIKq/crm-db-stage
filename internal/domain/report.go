package domain

type Report struct {
	ReportID      int    `json:"report_id" db:"report_id"`
	ReportDate    string `json:"report_date" db:"report_date"`
	OrderID       int    `json:"order_id" db:"order_id"`
	OrderNumber   string `json:"order_number" db:"order_number"`
	OrderClient   string `json:"order_client" db:"order_client"`
	OrderName     string `json:"order_name" db:"order_name"`
	OrderMaterial string `json:"order_material" db:"order_material"`
	Quantity      string `json:"quantity" db:"quantity"`
	IssuedPlan    string `json:"issued_plan" db:"issued_plan"`
	ReportEnd     string `json:"report_end" db:"report_end"`
	Issued        string `json:"issued" db:"issued"`
	Plan          string `json:"plan" db:"plan"`
	Operator      string `json:"operator" db:"operator"`
	Plot          string `json:"order_plot" db:"order_plot"`
	AddingDate    string `json:"adding_date" db:"adding_date"`
	RoutePosition string `json:"route_position" db:"route_position"`
	RouteID       string `json:"route_id" db:"route_id"`
}

type ReportTime struct {
	From string `json:"from"`
	To   string `json:"to"`
}

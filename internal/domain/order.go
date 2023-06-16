package domain

type Order struct {
	ID        string            `json:"id" db:"order_id"`
	TimeStamp string            `json:"timestamp" db:"order_timestamp"`
	Files     []string          `json:"files"`
	Number    string            `json:"number" db:"order_number"`
	Sample    string            `json:"sample" db:"order_sample"`
	Client    string            `json:"client" db:"order_client"`
	Name      string            `json:"name" db:"order_name"`
	Material  string            `json:"material" db:"order_material"`
	Quantity  string            `json:"quantity" db:"order_quantity"`
	Issued    string            `json:"issued" db:"order_issued"`
	M         string            `json:"m" db:"order_m"`
	EndTime   string            `json:"end_time" db:"order_endtime"`
	OTK       string            `json:"otk" db:"order_otk"`
	P         string            `json:"p" db:"order_p"`
	Comments  []string          `json:"comments"`
	Completed bool              `json:"completed"`
	Routes    map[string]*Route `json:"routes_json"`
	DbRoutes  []*Route          `json:"db_routes"`
}

type Route struct {
	User          string   `json:"user" db:"worker"`
	RouteID       string   `json:"route_id" db:"route_id"`
	Plot          string   `json:"plot" db:"plot_id"`
	RoutePosition string   `json:"route_position" db:"route_position"`
	Comments      []Report `json:"comments" db:"user"`
	IssuedReport  []Report `json:"issued_report" db:"user"`
	StartTime     string   `json:"start_time" db:"start_time"`
	OtkTime       string   `json:"otk_time" db:"otk_time"`
	EndTime       string   `json:"end_time" db:"end_time"`
	ErrorTime     string   `json:"error_time" db:"error_time"`
	ErrorMsg      string   `json:"error_msg" db:"error_value"`
	Quantity      string   `json:"quantity" db:"quantity"`
	Issued        string   `json:"issued" db:"issued"`
	OrderID       string   `json:"order_id" db:"order_id"`
}

type Report struct {
	Date  string `json:"date"`
	Value string `json:"value"`
}

type CheckRoute struct {
	RouteID  string `db:"route_id"`
	RoutePos string `db:"route_position"`
}

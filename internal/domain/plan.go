package domain

type PlanData struct {
	RouteID    string     `json:"route_id"`
	OrderID    string     `json:"order_id"`
	RoutePlot  string     `json:"route_plot"`
	Material   string     `json:"material"`
	Name       string     `json:"name"`
	Number     string     `json:"number"`
	Client     string     `json:"client"`
	Timestamp  string     `json:"timestamp"`
	AddedDates []DateInfo `json:"added_dates"`
}

type PlanShift struct {
	OrderID   string `json:"order_id"`
	Number    string `json:"number"`
	Client    string `json:"client"`
	Name      string `json:"name"`
	Material  string `json:"material"`
	Quantity  string `json:"quantity"`
	Issued    string `json:"issued"`
	LastDate  string `json:"last_date,omitempty"`
	RoutePlot string `json:"route_plot"`
	RouteID   string `json:"route_id"`
	MoveTo    string `json:"move_to"`
	Shifts    int    `json:"shifts"`
}

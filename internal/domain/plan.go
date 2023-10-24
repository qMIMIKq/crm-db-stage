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

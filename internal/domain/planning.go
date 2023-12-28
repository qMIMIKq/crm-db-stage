package domain

type Planning struct {
	ID           string       `json:"id" db:"planning_id"`
	OrderID      string       `json:"order_id" db:"order_id"`
	TimeStamp    interface{}  `json:"timestamp" db:"order_timestamp"`
	Number       string       `json:"number" db:"order_number"`
	Client       string       `json:"client" db:"order_client"`
	Position     string       `json:"position" db:"position"`
	Files        []string     `json:"files"`
	Name         string       `json:"name" db:"order_name"`
	Quantity     string       `json:"quantity" db:"order_quantity"`
	Issued       string       `json:"issued" db:"order_issued"`
	TimeOfModify interface{}  `json:"time_of_modify" db:"time_of_modify"`
	RouteID      string       `json:"route_id" db:"route_id"`
	RoutePlot    string       `json:"route_plot" db:"route_plot"`
	DBPlanDates  []DbPlanInfo `json:"db_plan"`
	AddedDates   []DateInfo   `json:"added_dates"`
	NeedShifts   int          `json:"need_shifts" db:"need_shifts"`
}

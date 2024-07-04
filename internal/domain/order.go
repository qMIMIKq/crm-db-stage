package domain

type Order struct {
	ID           string            `json:"id" db:"order_id"`
	TimeStamp    string            `json:"timestamp" db:"order_timestamp"`
	Files        []string          `json:"files"`
	Number       string            `json:"number" db:"order_number"`
	Sample       string            `json:"sample" db:"order_sample"`
	Client       string            `json:"client" db:"order_client"`
	Name         string            `json:"name" db:"order_name"`
	Material     string            `json:"material" db:"order_material"`
	PrevQuantity string            `json:"prev_quantity"`
	Quantity     string            `json:"quantity" db:"order_quantity"`
	Issued       string            `json:"issued" db:"order_issued"`
	M            string            `json:"m" db:"order_m"`
	EndTime      interface{}       `json:"end_time" db:"order_endtime"`
	OTK          string            `json:"otk" db:"order_otk"`
	P            string            `json:"p" db:"order_p"`
	Comments     []string          `json:"comments"`
	Completed    bool              `json:"completed" db:"completed"`
	Routes       map[string]*Route `json:"routes_json"`
	DbRoutes     []*Route          `json:"db_routes"`
	TimeOfModify interface{}       `json:"time_of_modify" db:"time_of_modify"`
	CanRemove    string            `json:"can_remove" db:"can_remove"`
}

type GetOrder struct {
	ArchiveFrom string `json:"archive_from"`
	ArchiveTo   string `json:"archive_to"`
	Old         bool   `json:"order_old"`
	Planning    bool   `json:"planning"`
	PlanFrom    string `json:"plan_from"`
	PlanTo      string `json:"plan_to"`
	UpdateOnly  bool   `json:"update_only"`
	UpdateTime  string `json:"update_time"`
	StartTime   string `json:"start_time"`
	IsClient    bool   `json:"is_client"`
	ClientName  string `json:"client_name"`
}

func (o *Order) SetFiles(file string) {
	o.Files = append(o.Files, file)
}

func (o *Order) SetComments(comment string) {
	o.Comments = append(o.Comments, comment)
}

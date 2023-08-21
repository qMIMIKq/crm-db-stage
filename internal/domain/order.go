package domain

import "time"

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
	EndTime   *time.Time        `json:"end_time" db:"order_endtime"`
	OTK       string            `json:"otk" db:"order_otk"`
	P         string            `json:"p" db:"order_p"`
	Comments  []string          `json:"comments"`
	Completed bool              `json:"completed" db:"completed"`
	Routes    map[string]*Route `json:"routes_json"`
	DbRoutes  []*Route          `json:"db_routes"`
}

type GetOrder struct {
	ArchiveFrom string `json:"archive_from"`
	ArchiveTo   string `json:"archive_to"`
	Old         bool   `json:"order_old"`
}

func (o *Order) SetFiles(file string) {
	o.Files = append(o.Files, file)
}

func (o *Order) SetComments(comment string) {
	o.Comments = append(o.Comments, comment)
}

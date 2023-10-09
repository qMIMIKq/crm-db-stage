package domain

type Plot struct {
	ID        int    `json:"id" db:"plot_id"`
	Name      string `json:"name" db:"plot_name"`
	ShortName string `json:"short_name" db:"nickname"`
	Disable   bool   `json:"disable" db:"disable"`
	CanDelete bool   `json:"can_delete"`
}

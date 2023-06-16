package domain

type Plot struct {
	ID   int    `json:"id" db:"plot_id"`
	Name string `json:"name" db:"plot_name"`
}

package domain

type Group struct {
	ID          int    `json:"id" db:"group_id"`
	Name        string `json:"name" db:"group_name"`
	Description string `json:"description" db:"description"`
}

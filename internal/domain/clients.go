package domain

type Client struct {
	ID   int    `json:"id" db:"client_id"`
	Name string `json:"name" db:"client_name"`
}

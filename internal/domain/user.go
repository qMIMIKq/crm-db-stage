package domain

type UserAuth struct {
	ID       int    `json:"-" db:"user_id"`
	Login    string `json:"login" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserInfo struct {
	ID       int    `json:"id" db:"user_id"`
	Name     string `json:"name" db:"user_name"`
	Nickname string `json:"nickname" db:"nickname"`
	Group    string `json:"group" db:"group_name"`
	GroupID  string `json:"group_id" db:"group_id"`
	Plot     string `json:"plot" db:"plot_name"`
	PlotID   string `json:"plot_id" db:"plot_id"`
	Login    string
	Password string
}

package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
)

type UsersPG struct {
	db *sqlx.DB
}

func (u UsersPG) GetUsersByGroupAndPlot(user domain.UserInfo) ([]domain.UserInfo, error) {
	var users []domain.UserInfo

	query := fmt.Sprintf(`
			SELECT u.user_id, u.user_name, 
				     g.group_name, g.group_id, 
             p.plot_name, p.plot_id
				FROM users_rights ur
             JOIN users u on u.user_id = ur.user_id
             JOIN groups g on g.group_id = ur.group_id
             JOIN plots p on p.plot_id = ur.plot_id
       WHERE g.group_name = $1
         AND p.plot_id = $2
       ORDER BY u.user_name DESC;
  `)

	err := u.db.Select(&users, query, user.Group, user.PlotID)
	return users, err
}

func (u UsersPG) GetOperators() ([]domain.UserInfo, error) {
	var users []domain.UserInfo

	query := fmt.Sprintf(`
			SELECT u.user_id, u.user_name, g.group_name, p.plot_name
				FROM users_rights ur
             JOIN users u on u.user_id = ur.user_id
             JOIN groups g on g.group_id = ur.group_id
             JOIN plots p on p.plot_id = ur.plot_id
       WHERE g.group_name = $1
       ORDER BY u.user_name DESC;
  `)

	err := u.db.Select(&users, query, "оператор")
	return users, err
}

func (u UsersPG) GetUsers() ([]domain.UserInfo, error) {
	var users []domain.UserInfo

	query := fmt.Sprintf(`
			SELECT u.user_id, u.user_name, g.group_name, p.plot_name
				FROM users_rights ur
             JOIN users u on u.user_id = ur.user_id
             JOIN groups g on g.group_id = ur.group_id
             JOIN plots p on p.plot_id = ur.plot_id
       ORDER BY u.user_name DESC;
  `)

	err := u.db.Select(&users, query)
	return users, err
}

func (u UsersPG) GetUsersByGroup(group string) ([]domain.UserInfo, error) {
	var users []domain.UserInfo

	query := fmt.Sprintf(`
			SELECT u.user_id, u.user_name, g.group_name, p.plot_name
				FROM users_rights ur
             JOIN users u on u.user_id = ur.user_id
             JOIN groups g on g.group_id = ur.group_id
             JOIN plots p on p.plot_id = ur.plot_id
       WHERE g.group_name = $1
       ORDER BY u.user_name DESC;
  `)

	err := u.db.Select(&users, query, group)
	return users, err
}

func NewUsersPG(db *sqlx.DB) *UsersPG {
	return &UsersPG{db: db}
}

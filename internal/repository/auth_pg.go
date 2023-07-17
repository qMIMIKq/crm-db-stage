package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
)

type AuthPG struct {
	db *sqlx.DB
}

func (a AuthPG) GetUser(user domain.UserAuth) (domain.UserInfo, error) {
	query := fmt.Sprintf(`
		SELECT u.user_name, u.nickname, g.group_name, g.group_id,
           p.plot_name, p.plot_id
      FROM users_rights ur
           JOIN users u on u.user_id = ur.user_id
           JOIN groups g on g.group_id = ur.group_id
           JOIN plots p on p.plot_id = ur.plot_id
      WHERE u.login = $1
			  AND u.password = $2;
  `)

	var u domain.UserInfo
	err := a.db.Get(&u, query, user.Login, user.Password)

	return u, err
}

func NewAuthPG(db *sqlx.DB) *AuthPG {
	return &AuthPG{
		db: db,
	}
}

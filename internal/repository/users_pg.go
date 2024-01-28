package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"time"
)

type UsersPG struct {
	db *sqlx.DB
}

func (u *UsersPG) GetUserByID(id string) (domain.UserInfo, error) {
	query := fmt.Sprintf(`
		SELECT u.user_id, u.login, 
		       u.user_name, u.nickname, 
		       u.disable, u.general, 
		       g.group_name, g.group_id, 
					 p.plot_name, p.plot_id
      FROM users_rights ur
           JOIN users u on u.user_id = ur.user_id
           JOIN groups g on g.group_id = ur.group_id
           JOIN plots p on p.plot_id = ur.plot_id
     WHERE u.user_id = $1
  `)

	var user domain.UserInfo
	err := u.db.Get(&user, query, id)

	log.Info().Interface("user", user).Msg("user is")

	return user, err
}

func (u *UsersPG) GetUsersByGroupAndPlot(user domain.UserInfo) ([]domain.UserInfo, error) {
	var users []domain.UserInfo

	query := fmt.Sprintf(`
			SELECT u.user_id, u.user_name, u.general, 
				     g.group_name, g.group_id, 
             p.plot_name, p.plot_id
				FROM users_rights ur
             JOIN users u on u.user_id = ur.user_id
             JOIN groups g on g.group_id = ur.group_id
             JOIN plots p on p.plot_id = ur.plot_id
       WHERE g.group_name = $1
         AND p.plot_id = $2
				 AND u.disable = false
         AND u.general = false
       ORDER BY u.user_name DESC;
  `)

	err := u.db.Select(&users, query, user.Group, user.PlotID)
	return users, err
}

func (u *UsersPG) GetOperators() ([]domain.UserInfo, error) {
	var users []domain.UserInfo

	query := fmt.Sprintf(`
			SELECT u.user_id, u.user_name, 
			       u.nickname, u.general, 
			       g.group_name, p.plot_name
				FROM users_rights ur
             JOIN users u on u.user_id = ur.user_id
             JOIN groups g on g.group_id = ur.group_id
             JOIN plots p on p.plot_id = ur.plot_id
       WHERE g.group_name = $1 
				 AND u.disable = false
         AND u.general = false
       ORDER BY u.user_name DESC;
  `)

	err := u.db.Select(&users, query, "оператор")
	return users, err
}

func (u *UsersPG) GetManagers() ([]domain.UserInfo, error) {
	var users []domain.UserInfo

	query := fmt.Sprintf(`
			SELECT u.user_id, u.user_name, 
			       u.nickname, u.general, 
			       g.group_name, p.plot_name
				FROM users_rights ur
             JOIN users u on u.user_id = ur.user_id
             JOIN groups g on g.group_id = ur.group_id
             JOIN plots p on p.plot_id = ur.plot_id
       WHERE g.group_name = $1 
				 AND u.disable = false
         AND u.general = false
       ORDER BY u.user_name DESC;
  `)

	err := u.db.Select(&users, query, "менеджер")
	log.Info().Interface("managers", users).Msg("managers is")
	return users, err
}

func (u *UsersPG) GetAllUsers() (domain.Users, error) {
	query := fmt.Sprintf(`
		SELECT u.user_id, u.user_name, u.nickname, u.disable, g.group_name, p.plot_name
      FROM users_rights ur
           JOIN users u on u.user_id = ur.user_id
           JOIN groups g on g.group_id = ur.group_id
           JOIN plots p on p.plot_id = ur.plot_id
     ORDER BY u.disable;
	`)

	var users domain.Users
	err := u.db.Select(&users, query)

	return users, err
}

func (u *UsersPG) GetUsers() ([]domain.UserInfo, error) {
	var users []domain.UserInfo

	query := fmt.Sprintf(`
			SELECT u.user_id, u.user_name, u.nickname, g.group_name, p.plot_name
				FROM users_rights ur
             JOIN users u on u.user_id = ur.user_id
             JOIN groups g on g.group_id = ur.group_id
             JOIN plots p on p.plot_id = ur.plot_id
       WHERE u.disable = false
       ORDER BY u.user_name DESC;
  `)

	err := u.db.Select(&users, query)
	return users, err
}

func (u *UsersPG) GetUsersByGroup(group string) ([]domain.UserInfo, error) {
	var users []domain.UserInfo

	query := fmt.Sprintf(`
			SELECT u.user_id, u.user_name, u.nickname, g.group_name, p.plot_name
				FROM users_rights ur
             JOIN users u on u.user_id = ur.user_id
             JOIN groups g on g.group_id = ur.group_id
             JOIN plots p on p.plot_id = ur.plot_id
       WHERE g.group_name = $1
 			   AND u.disable = false		
       ORDER BY u.user_name DESC;
  `)

	err := u.db.Select(&users, query, group)
	return users, err
}

func (u *UsersPG) DeleteUser(userID string) error {
	query := fmt.Sprintf(`
		DELETE FROM users WHERE user_id = $1
		RETURNING nickname
	`)

	var userNickname string
	err := u.db.QueryRow(query, userID).Scan(&userNickname)

	log.Info().Msgf("user nickname %s", userNickname)

	return err
}

func (u *UsersPG) EditUser(user domain.UserInfo) error {
	tx, err := u.db.Begin()
	if err != nil {
		return err
	}

	var args []interface{}
	args = append(args, user.Name, user.Login)

	setter := fmt.Sprintf("SET user_name = $1, login = $2")
	if len(user.Password) > 0 {
		setter += fmt.Sprintf(", password = $%d", len(args)+1)
		args = append(args, user.Password)
	}

	if len(user.Nickname) > 0 {
		setter += fmt.Sprintf(", nickname = $%d", len(args)+1)
		args = append(args, user.Nickname)
	}

	setter += fmt.Sprintf(", disable = $%d", len(args)+1)
	args = append(args, user.Disable)

	log.Info().Interface("user", user).Msg("UPDATE USER IS")

	setter += fmt.Sprintf(", general = $%d", len(args)+1)
	args = append(args, user.General)

	log.Info().Interface("args", args).Msg("ARGS")

	setter += fmt.Sprintf(" WHERE users.user_id = $%d", len(args)+1)
	userQuery := fmt.Sprintf(`UPDATE users %s`, setter)
	args = append(args, user.ID)

	var oldNickname string
	oldQuery := fmt.Sprintf(`
		SELECT nickname from users WHERE user_id = $1
	`)

	err = u.db.Get(&oldNickname, oldQuery, user.ID)
	if err != nil {
		log.Err(err).Caller().Msg("error is")
		return err
	}

	checkQuery := fmt.Sprintf(`
		SELECT order_id FROM routes WHERE worker = $1 
	`)

	var ordersID []int
	err = u.db.Select(&ordersID, checkQuery, oldNickname)
	if err != nil {
		log.Err(err).Caller().Msg("error is")
		return err
	}

	loc, _ := time.LoadLocation("Europe/Moscow")
	timeOfModify := time.Now().In(loc).Format("2006-01-02 15:04:05")
	for _, orderID := range ordersID {
		updateOrderQuery := fmt.Sprintf(`
			UPDATE orders SET time_of_modify = $1 WHERE order_id = $2 AND completed = false
		`)

		_, err := u.db.Exec(updateOrderQuery, timeOfModify, orderID)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
			return err
		}
	}

	routesQuery := fmt.Sprintf(`
		UPDATE routes SET worker = $1 WHERE worker = $2
	`)

	log.Info().Interface("oldNickname", oldNickname).Msg("oldNickname!!")
	_, err = u.db.Exec(routesQuery, user.Nickname, oldNickname)
	if err != nil {
		log.Err(err).Caller().Msg("error is")
		return err
	}

	_, err = tx.Exec(userQuery, args...)
	if err != nil {
		tx.Rollback()
		return err
	}

	rightsQuery := fmt.Sprintf(`
			UPDATE users_rights
				 SET group_id = $1, plot_id = $2
		   WHERE user_id = $3;
	`)

	_, err = tx.Exec(rightsQuery, user.GroupID, user.PlotID, user.ID)
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return err
	}

	return nil
}
func (u *UsersPG) CreateUser(user domain.UserInfo) (int, error) {
	tx, err := u.db.Begin()
	if err != nil {
		return 0, err
	}

	userQuery := fmt.Sprintf(`
			INSERT INTO users (user_name, login, password, nickname, general)
			VALUES ($1, $2, $3, $4, $5)								 
   RETURNING user_id;
	`)

	var id int
	err = tx.QueryRow(userQuery, user.Name, user.Login, user.Password, user.Nickname, user.General).Scan(&id)
	if err != nil {
		tx.Rollback()
		return 0, err
	}

	rightsQuery := fmt.Sprintf(`
			INSERT INTO users_rights (user_id, group_id, plot_id)
			VALUES ($1, $2, $3)
	`)

	_, err = tx.Exec(rightsQuery, id, user.GroupID, user.PlotID)
	if err != nil {
		tx.Rollback()
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return 0, err
	}

	return id, nil
}

func NewUsersPG(db *sqlx.DB) *UsersPG {
	return &UsersPG{db: db}
}

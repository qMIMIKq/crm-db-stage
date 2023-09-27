package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
)

type GroupsPG struct {
	db *sqlx.DB
}

func (g GroupsPG) EditGroup(group domain.Group) error {
	tx, err := g.db.Begin()
	if err != nil {
		tx.Rollback()
		return err
	}

	groupQuery := fmt.Sprintf(`
			UPDATE groups
				 SET group_name = $1
			 WHERE group_id = $2;
	`)

	_, err = tx.Exec(groupQuery, group.Name, group.ID)
	if err != nil {
		tx.Rollback()
		return err
	}

	descriptionQuery := fmt.Sprintf(`
			UPDATE groups_description
				 SET description = $1
			 WHERE group_id = $2;
	`)

	_, err = tx.Exec(descriptionQuery, group.Description, group.ID)
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

func (g GroupsPG) GetGroupByID(groupID string) (domain.Group, error) {
	query := fmt.Sprintf(`
			SELECT g.group_id, g.group_name, gr.description
				FROM groups g
						 JOIN groups_description gr
             USING(group_id)
			 WHERE g.group_id = $1
	`)

	var group domain.Group
	err := g.db.Get(&group, query, groupID)

	return group, err
}

func (g GroupsPG) GetGroups() ([]domain.Group, error) {
	query := fmt.Sprintf(`
			SELECT g.group_id, g.group_name, gr.description
				FROM groups g
						 JOIN groups_description gr
             USING(group_id);
	`)

	var groups []domain.Group
	err := g.db.Select(&groups, query)

	return groups, err
}

func NewGroupsPG(db *sqlx.DB) *GroupsPG {
	return &GroupsPG{db: db}
}

package repository

import (
	"github.com/jmoiron/sqlx"
)

type InitPG struct {
	db *sqlx.DB
}

func (i InitPG) InitDB() error {
	//groups := fmt.Sprintf(`
	//	CREATE TABLE groups
	//	(
	//		group_id   SERIAL UNIQUE PRIMARY KEY NOT NULL,
	//		group_name varchar(255)
	//	);
	//`)
	//groupsContent := fmt.Sprintf(`
	//`)

	//TODO implement me
	panic("implement me")
}

func NewInitPG(db *sqlx.DB) *InitPG {
	return &InitPG{db: db}
}

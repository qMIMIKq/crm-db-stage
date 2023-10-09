package repository

import (
	"fmt"
	"github.com/jmoiron/sqlx"
)

type InitPG struct {
	db *sqlx.DB
}

func (i InitPG) InitDB() error {
	checkQuery := fmt.Sprintf(`
		SELECT * FROM groups WHERE group_id = 1;
	`)

	_, err := i.db.Exec(checkQuery)
	if err != nil {
		initQuery := fmt.Sprintf(`
		SET timezone = 'Europe/Moscow';

		CREATE TABLE IF NOT EXISTS groups
		(
				group_id   SERIAL UNIQUE PRIMARY KEY NOT NULL,
				group_name varchar(255)
		);
		
		INSERT INTO groups (group_name)
		VALUES ('супер-админ'),
					 ('админ'),
					 ('технолог'),
					 ('менеджер'),
					 ('оператор');
		
		CREATE TABLE IF NOT EXISTS groups_description
		(
				description_id serial unique primary key                          not null,
				group_id       int references groups (group_id) ON DELETE CASCADE NOT NULL,
				description    varchar(255) default 'Нет данных'
		);
		
		insert into groups_description (group_id, description)
		VALUES (1, 'супер админ'),
					 (2, 'админ'),
					 (3, 'технолог'),
					 (4, 'менеджер'),
					 (5, 'оператор');
		
		CREATE TABLE IF NOT EXISTS plots
		(
				plot_id   SERIAL UNIQUE PRIMARY KEY NOT NULL,
				plot_name VARCHAR(255)              NOT NULL,
				nickname  varchar(255) DEFAULT '',
			  disable     boolean      default false
		);
		
		INSERT INTO plots (plot_name, nickname)
		VALUES ('все', 'все'),
					 ('тестовый участок 1', 'ТУ-1'),
					 ('тестовый участок 2', 'ТУ-2');
		
		CREATE TABLE IF NOT EXISTS filters
		(
				filter_id   SERIAL UNIQUE PRIMARY KEY                        NOT NULL,
				filter_name VARCHAR(255)                                     NOT NULL,
				plot_id     INT REFERENCES plots (plot_id) ON DELETE CASCADE NOT NULL,
				start_time  varchar(255) default '08:00',
				end_time    varchar(255) default '20:00',
				nickname    varchar(255) default '',
				position    integer      default 0,
				disable     boolean      default false
		);

		INSERT INTO filters (filter_name, plot_id)
		VALUES ('ТФ-1', '2'),
					 ('ТФ-2', '3');
		
		CREATE TABLE IF NOT EXISTS users
		(
				user_id   SERIAL UNIQUE PRIMARY KEY NOT NULL,
				user_name VARCHAR(255),
				login     VARCHAR(255),
				password  VARCHAR(255),
				nickname  VARCHAR(255),
				disable   boolean DEFAULT FALSE
		);
		
		CREATE TABLE IF NOT EXISTS users_rights
		(
				right_id SERIAL UNIQUE PRIMARY KEY        NOT NULL,
				user_id  int references users (user_id)   NOT NULL,
				group_id INT REFERENCES groups (group_id) NOT NULL,
				plot_id  INT REFERENCES plots (plot_id)   NOT NULL
		);
		
		CREATE TABLE IF NOT EXISTS clients
		(
				client_id   SERIAL UNIQUE PRIMARY KEY NOT NULL,
				client_name VARCHAR(255) UNIQUE       NOT NULL
		);
		
		INSERT INTO users (user_name, login, password, nickname)
		VALUES ('Админ А', 'admin', '61736461333132646173011c945f30ce2cbafc452f39840f025693339c42', 'SuperAdmin');
		INSERT INTO users_rights (user_id, group_id, plot_id)
		VALUES (1, 1, 1);
		
		CREATE table IF NOT EXISTS orders
		(
				order_id        SERIAL UNIQUE PRIMARY KEY NOT NULL,
				order_timestamp timestamptz  default CURRENT_TIMESTAMP::timestamptz,
				order_number    varchar(255),
				order_sample    varchar(255),
				order_client    varchar(255),
				order_name      varchar(255),
				order_material  varchar(255),
				order_quantity  varchar(255),
				order_issued    varchar(255) default '',
				order_m         varchar(255) default '',
				order_endtime   date                      null,
				order_otk       varchar(255),
				order_p         varchar(255),
				completed       boolean      default false
		);
		
		CREATE TABLE IF NOT EXISTS routes
		(
				route_id          SERIAL UNIQUE PRIMARY KEY NOT NULL,
				route_position    int,
				plot_id           varchar(255),
				order_id          int references orders (order_id) on delete cascade,
				worker            varchar(255),
				quantity          varchar(255),
				issued            varchar(255),
				start_time        varchar(255),
				end_time          varchar(255),
				pause_time        varchar(255),
				pause_value       text         default '',
				error_time        varchar(255),
				error_value       varchar(255),
				day_quantity      varchar(255) default '',
				theor_end         varchar(255) default '',
				dyn_end           varchar(255) default '',
				plan_date         varchar(255) default '',
				plan_start        varchar(255) default '',
				plan_exclude_days text         default '',
				plan_faster       boolean      default false,
				last_comment      text         default '',
				plan_dates        text         default ''
		);
		
		create table IF NOT EXISTS route_comments
		(
				comment_id serial unique primary key not null,
				route_id   int references routes (route_id) on update cascade on delete cascade,
				date       varchar(255),
				value      varchar(255)
		);
		
		create table IF NOT EXISTS route_issued
		(
				issued_id serial unique primary key not null,
				route_id  int references routes (route_id) on update cascade on delete cascade,
				date      varchar(255),
				value     varchar(255)
		);
		
		INSERT INTO orders (order_number,
												order_sample,
												order_client, order_name,
												order_material, order_quantity,
												order_issued, order_endtime, order_otk, order_p)
		VALUES (1, '-', 'Тестовый Клиент', 'Тестовый заказ', 'Тестовый материал', '', '', '2023-04-12', '',
						'');
		
		create table IF NOT EXISTS files
		(
				file_id   SERIAL UNIQUE PRIMARY KEY                          NOT NULL,
				file_name VARCHAR(255)                                       NOT NULL,
				order_id  INT REFERENCES orders (order_id) ON DELETE CASCADE NOT NULL
		);
		
		create table IF NOT EXISTS comments
		(
				comment_id     SERIAL UNIQUE PRIMARY KEY NOT NULL,
				comment_text   TEXT,
				comment_author varchar(255),
				order_id       INT REFERENCES orders (order_id) ON DELETE CASCADE
		);
		
		CREATE TABLE IF NOT EXISTS reports
		(
				report_id      serial unique PRIMARY KEY NOT NULL,
				report_date    date,
				order_id       int,
				order_number   varchar(255),
				order_client   varchar(255),
				order_name     varchar(255),
				order_material varchar(255),
				order_plot     varchar(255),
				adding_date    date,
				quantity       varchar(255),
				issued         varchar(255),
				plan           varchar(255),
				operator       varchar(255),
				issued_plan    varchar(255),
				route_position varchar(255) default '0',
				route_id       integer      default 0
		);
		
		create table IF NOT EXISTS plans
		(
				plan_id    serial unique PRIMARY KEY NOT NULL,
				route_id   integer      default 0,
				order_id   integer      default 0,
				route_plot varchar(255) default '',
				plan_date  date,
				divider    varchar(255),
				queues     varchar(255)
		);
	`)

		_, err = i.db.Exec(initQuery)
	}

	return err
}

func NewInitPG(db *sqlx.DB) *InitPG {
	return &InitPG{db: db}
}

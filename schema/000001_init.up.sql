SET timezone = 'Europe/Moscow';

CREATE TABLE groups
(
    group_id   SERIAL UNIQUE PRIMARY KEY NOT NULL,
    group_name VARCHAR(255)
);

INSERT INTO groups (group_name)
VALUES ('супер-админ'),
       ('админ'),
       ('технолог'),
       ('менеджер'),
       ('оператор');

CREATE TABLE groups_description
(
    description_id serial unique primary key                          not null,
    group_id       INT REFERENCES groups (group_id) ON DELETE CASCADE NOT NULL,
    description    VARCHAR(255) DEFAULT 'Нет данных'
);

insert INTo groups_description (group_id, description)
VALUES (1, 'супер админ'),
       (2, 'админ'),
       (3, 'технолог'),
       (4, 'менеджер'),
       (5, 'оператор');

CREATE TABLE plots
(
    plot_id   SERIAL UNIQUE PRIMARY KEY NOT NULL,
    plot_name VARCHAR(255)              NOT NULL,
    nickname  VARCHAR(255) DEFAULT ''
);

INSERT INTO plots (plot_name)
VALUES ('все'),
       ('фрезерный участок'),
       ('токарный участок'),
       ('фрезерный (рыжики) участок');

CREATE TABLE filters
(
    filter_id   SERIAL UNIQUE PRIMARY KEY                        NOT NULL,
    filter_name VARCHAR(255)                                     NOT NULL,
    plot_id     INT REFERENCES plots (plot_id) ON DELETE CASCADE NOT NULL,
    start_time  VARCHAR(255) DEFAULT '08:20',
    end_time    VARCHAR(255) DEFAULT '20:00',
    nickname    VARCHAR(255) DEFAULT '',
    position    INTeger      DEFAULT 0,
    disable     boolean      DEFAULT false
);

CREATE TABLE users
(
    user_id   SERIAL UNIQUE PRIMARY KEY NOT NULL,
    user_name VARCHAR(255),
    login     VARCHAR(255),
    password  VARCHAR(255),
    nickname  VARCHAR(255),
    disable   boolean DEFAULT FALSE,
    general   boolean DEFAULT FALSE
);

CREATE TABLE users_rights
(
    right_id SERIAL UNIQUE PRIMARY KEY                        NOT NULL,
    user_id  INT REFERENCES users (user_id) ON DELETE CASCADE NOT NULL,
    group_id INT REFERENCES groups (group_id)                 NOT NULL,
    plot_id  INT REFERENCES plots (plot_id)                   NOT NULL
);

CREATE TABLE clients
(
    client_id   SERIAL UNIQUE PRIMARY KEY NOT NULL,
    client_name VARCHAR(255) UNIQUE       NOT NULL
);

INSERT INTO users (user_name, login, password, nickname)
VALUES ('Админ А', 'admin', '61736461333132646173011c945f30ce2cbafc452f39840f025693339c42', 'SuperAdmin');
INSERT INTO users_rights (user_id, group_id, plot_id)
VALUES (1, 1, 1);

CREATE table orders
(
    order_id        SERIAL UNIQUE PRIMARY KEY NOT NULL,
    order_timestamp timestamp with time zone DEFAULT CURRENT_TIMESTAMP::timestamptz,
    order_number    VARCHAR(255),
    order_sample    VARCHAR(255),
    order_client    VARCHAR(255),
    order_name      VARCHAR(255),
    order_material  VARCHAR(255),
    order_quantity  VARCHAR(255),
    order_issued    VARCHAR(255)             DEFAULT '',
    order_m         VARCHAR(255)             DEFAULT '',
    order_endtime   DATE                      null,
    order_otk       VARCHAR(255),
    order_p         VARCHAR(255),
    completed       boolean                  DEFAULT false,
    time_of_modify  timestamp without time zone
);

CREATE TABLE routes
(
    route_id          SERIAL UNIQUE PRIMARY KEY NOT NULL,
    route_position    INT,
    plot_id           VARCHAR(255),
    order_id          INT REFERENCES orders (order_id) on delete cascade,
    worker            VARCHAR(255),
    quantity          VARCHAR(255),
    issued            VARCHAR(255),
    start_time        VARCHAR(255),
    end_time          VARCHAR(255),
    pause_time        VARCHAR(255),
    pause_value       text         DEFAULT '',
    error_time        VARCHAR(255),
    error_value       VARCHAR(255),
    day_quantity      VARCHAR(255) DEFAULT '',
    theor_end         VARCHAR(255) DEFAULT '',
    dyn_end           VARCHAR(255) DEFAULT '',
    plan_date         VARCHAR(255) DEFAULT '',
    plan_start        VARCHAR(255) DEFAULT '',
    plan_exclude_days text         DEFAULT '',
    plan_faster       boolean      DEFAULT false,
    last_comment      text         DEFAULT '',
    issued_plan       VARCHAR(255) DEFAULT '',
    plan_dates        text         DEFAULT '',
    planned           boolean      default false,
    time              real         DEFAULT 0,
    up                INT          DEFAULT 0,
    adjustment        INT          DEFAULT 0,
    need_shifts       INT,
    shift             VARCHAR(255) DEFAULT ''
);

create table route_comments
(
    comment_id serial unique primary key not null,
    route_id   INT REFERENCES routes (route_id) on update cascade on delete cascade,
    DATE       VARCHAR(255),
    value      VARCHAR(255)
);

create table route_issued
(
    issued_id serial unique primary key not null,
    route_id  INT REFERENCES routes (route_id) on update cascade on delete cascade,
    DATE      VARCHAR(255),
    value     VARCHAR(255)
);

INSERT INTO orders (order_number,
                    order_sample,
                    order_client, order_name,
                    order_material, order_quantity,
                    order_issued, order_endtime, order_otk, order_p)
VALUES (1, '-', 'Тестовый Клиент', 'Тестовый заказ', 'Тестовый материал', '10000', '5', '2023-04-12', 'ОТК',
        '1дн');

create table files
(
    file_id   SERIAL UNIQUE PRIMARY KEY                          NOT NULL,
    file_name VARCHAR(255)                                       NOT NULL,
    order_id  INT REFERENCES orders (order_id) ON DELETE CASCADE NOT NULL
);

create table comments
(
    comment_id     SERIAL UNIQUE PRIMARY KEY NOT NULL,
    comment_text   TEXT,
    comment_author VARCHAR(255),
    order_id       INT REFERENCES orders (order_id) ON DELETE CASCADE
);

CREATE TABLE reports
(
    report_id       serial unique PRIMARY KEY NOT NULL,
    report_date     DATE,
    order_id        INT,
    order_number    VARCHAR(255),
    order_client    VARCHAR(255),
    order_name      VARCHAR(255),
    order_material  VARCHAR(255),
    order_plot      VARCHAR(255),
    adding_date     DATE,
    quantity        VARCHAR(255),
    issued          VARCHAR(255),
    plan            VARCHAR(255),
    operator        VARCHAR(255),
    issued_plan     VARCHAR(255),
    route_position  VARCHAR(255) DEFAULT '0',
    route_id        INT,
    order_timestamp DATE,
    need_shifts     INT          DEFAULT 0,
    shift           VARCHAR(255) DEFAULT '',
    not_planned     boolean      DEFAULT false,
    current_shift   INT          DEFAULT 0,
    adjustment      VARCHAR(255) DEFAULT ''
);

create table plans
(
    plan_id    serial unique PRIMARY KEY NOT NULL,
    route_id   INT REFERENCES routes (route_id) on update cascade on delete cascade,
    order_id   INT REFERENCES orders (order_id) on update cascade on delete cascade,
    route_plot VARCHAR(255) DEFAULT '',
    plan_date  DATE,
    divider    VARCHAR(255),
    queues     VARCHAR(255)
);

create table planning
(
    planning_id     serial unique PRIMARY KEY NOT NULL,
    route_id        INT REFERENCES routes (route_id) on update cascade on delete cascade,
    route_plot      VARCHAR(255) DEFAULT '',
    order_id        INT REFERENCES orders (order_id) on update cascade on delete cascade,
    order_timestamp timestamptz,
    time_of_modify  timestamp,
    order_number    VARCHAR(255),
    order_client    VARCHAR(255),
    order_name      VARCHAR(255),
    order_material  VARCHAR(255),
    order_quantity  VARCHAR(255),
    order_issued    VARCHAR(255) DEFAULT '',
    need_shifts     integer      DEFAULT 0,
    position        VARCHAR(255) DEFAULT ''
);

CREATE TABLE time_reports
(
    id                SERIAL UNIQUE PRIMARY KEY NOT NULL,
    route_id          INT REFERENCES routes (route_id) ON UPDATE CASCADE ON DELETE CASCADE,
    route_plot        VARCHAR(255) DEFAULT '',
    before_start      VARCHAR(255) DEFAULT '',
    from_start_to_end VARCHAR(255) DEFAULT '',
    error             VARCHAR(255) DEFAULT '',
    paused            VARCHAR(255) DEFAULT ''
);

CREATE TABLE time_reports_plots
(
    id          SERIAL UNIQUE PRIMARY KEY NOT NULL,
    expectation VARCHAR(255) DEFAULT ''
);
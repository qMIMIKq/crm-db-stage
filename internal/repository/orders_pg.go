package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"strings"
)

type OrdersPG struct {
	db *sqlx.DB
}

func (o OrdersPG) UpdateOrders(orders []*domain.Order) error {
	query := fmt.Sprintf(`
			UPDATE orders 
				 SET order_number = $1 ,order_sample = $2, order_client = $3, order_name = $4,
						 order_material = $5, order_quantity = $6, order_issued = $7, order_m = $8,
						 order_endtime = $9, order_otk = $10, order_p = $11, completed = $12
			WHERE order_id = $13
	`)

	fileQuery := fmt.Sprintf(`
	  INSERT INTO files
						(file_name, order_id)
		 VALUES ($1, $2)
	`)

	getFilesQuery := fmt.Sprintf(`
		SELECT file_name FROM files WHERE order_id = $1
	`)

	commentsQuery := fmt.Sprintf(`
		INSERT INTO comments (comment_text, order_id)
		VALUES ($1, $2)	
	`)

	var files []string

	var err error
	for _, order := range orders {
		_, err = o.db.Exec(query, order.Number, order.Sample,
			order.Client, order.Name, order.Material, order.Quantity,
			order.Issued, order.M, order.EndTime, order.OTK,
			order.P, order.Completed, order.ID)

		err = o.db.Select(&files, getFilesQuery, order.ID)
		for _, file := range order.Files {
			if file != "" && !o.findFile(files, file) {
				_, err = o.db.Exec(fileQuery, file, order.ID)
			}
		}

		for _, comment := range order.Comments {
			if comment != "" {
				_, err = o.db.Exec(commentsQuery, comment, order.ID)
			}
		}

		routesQuery := fmt.Sprintf(`
			INSERT INTO routes (order_id, route_position, worker, plot_id, quantity,
													issued, start_time, end_time,
													otk_time, error_time, error_value, day_quantity, theor_end, dyn_end, plan_date)
						 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
			RETURNING route_id
		`)

		routeCommentsQuery := fmt.Sprintf(`
			INSERT INTO route_comments (route_id, date, value) VALUES ($1, $2, $3)
		`)

		for name, route := range order.Routes {
			var routeID int
			routePos := strings.Split(name, "-")[1]

			routesCheck := fmt.Sprintf(`
				SELECT route_id, route_position FROM routes WHERE order_id = $1 AND route_position = $2 LIMIT 1
			`)

			routesUpdateQuery := fmt.Sprintf(`
				UPDATE routes SET worker = $1, plot_id = $2, quantity = $3,
						   issued = $4, start_time = $5, end_time = $6,
							 otk_time = $7, error_time = $8, error_value = $9, day_quantity = $10, theor_end = $11, dyn_end = $12, plan_date = $13
			   WHERE order_id = $14 AND route_position = $15
			`)

			var dbRoutePos []domain.CheckRoute
			err = o.db.Select(&dbRoutePos, routesCheck, order.ID, routePos)

			if len(dbRoutePos) > 0 {
				_, err = o.db.Exec(routesUpdateQuery, route.User, route.Plot,
					route.Quantity, route.Issued, route.StartTime,
					route.EndTime, route.OtkTime, route.ErrorTime, route.ErrorMsg, route.DayQuantity, route.TheorEnd, route.DynEnd, route.PlanDate, order.ID, routePos)

				_, err = o.db.Exec("DELETE FROM route_comments WHERE route_id = $1", dbRoutePos[0].RouteID)
				for _, comment := range route.Comments {
					if len(comment.Date) > 0 {
						_, err = o.db.Exec(routeCommentsQuery, dbRoutePos[0].RouteID, comment.Date, comment.Value)
					}
				}

				log.Err(err).Caller().Msg("Error")
			} else {
				log.Info().Interface("route", route).Msgf("Route")

				err = o.db.QueryRow(routesQuery, order.ID,
					routePos, route.User, route.Plot,
					route.Quantity, route.Issued, route.StartTime, route.EndTime, route.OtkTime, route.ErrorTime, route.ErrorMsg, route.DayQuantity, route.TheorEnd, route.DynEnd, route.PlanDate).Scan(&routeID)
				log.Err(err).Caller().Msg("Error")
				for _, comment := range route.Comments {
					if len(comment.Date) > 0 {
						_, err = o.db.Exec(routeCommentsQuery, routeID, comment.Date, comment.Value)
					}
				}
			}
		}
	}

	return err
}

func (o OrdersPG) AddOrders(orders []*domain.Order) error {
	orderQuery := fmt.Sprintf(`
			INSERT INTO orders
						 (order_number,order_sample,order_client,order_name,
						 order_material, order_quantity, order_issued, order_m, order_endtime, order_otk, order_p)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING order_id
	`)

	fileQuery := fmt.Sprintf(`
	  INSERT INTO files
						(file_name, order_id)
		 VALUES ($1, $2)
	`)

	getFilesQuery := fmt.Sprintf(`
		SELECT file_name FROM files WHERE order_id = $1
	`)

	commentsQuery := fmt.Sprintf(`
		INSERT INTO comments (comment_text, order_id)
		VALUES ($1, $2)	
	`)

	routesQuery := fmt.Sprintf(`
			INSERT INTO routes (order_id, route_position, worker, plot_id, quantity,
													issued, start_time, end_time,
													otk_time, error_time, error_value, day_quantity, theor_end, dyn_end, plan_date)
						 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
			RETURNING route_id
		`)

	routeCommentsQuery := fmt.Sprintf(`
			INSERT INTO route_comments (route_id, date, value) VALUES ($1, $2, $3)
		`)

	var files []string

	var err error
	var id int
	for _, order := range orders {
		err = o.db.QueryRow(orderQuery, order.Number, order.Sample, order.Client,
			order.Name, order.Material, order.Quantity, order.Issued, order.M, order.EndTime, order.OTK, order.P).Scan(&id)

		err = o.db.Select(&files, getFilesQuery, id)
		for _, file := range order.Files {
			if file != "" && !o.findFile(files, file) {
				_, err = o.db.Exec(fileQuery, file, id)
			}
		}

		for _, comment := range order.Comments {
			if comment != "" {
				_, err = o.db.Exec(commentsQuery, comment, id)
			}
		}

		var routeID int
		for name, route := range order.Routes {
			routePos := strings.Split(name, "-")[1]
			err = o.db.QueryRow(routesQuery, id,
				routePos, route.User, route.Plot,
				route.Quantity, route.Issued, route.StartTime, route.OtkTime, route.EndTime, route.ErrorTime, route.ErrorMsg, route.DayQuantity, route.TheorEnd, route.DynEnd, route.PlanDate).Scan(&routeID)

			if err != nil {
				fmt.Println(err)
			}

			for _, comment := range route.Comments {
				if len(comment.Date) > 0 {
					_, err = o.db.Exec(routeCommentsQuery, routeID, comment.Date, comment.Value)
				}
			}
		}
	}

	return err
}

func (o OrdersPG) findFile(files []string, file string) bool {
	for _, f := range files {
		if f == file {
			return true
		}
	}

	return false
}

func (o OrdersPG) DeleteOrderByID(id int) error {
	_, err := o.db.Exec("DELETE FROM orders WHERE order_id = $1", id)
	return err
}

func (o OrdersPG) GetOrders(old bool) ([]*domain.Order, error) {
	log.Info().Msg("Getting orders")

	var query string
	if old {
		query = fmt.Sprintf(`
			SELECT * FROM orders WHERE completed = true ORDER BY order_id ASC;
		`)
	} else {
		query = fmt.Sprintf(`
			SELECT * FROM orders WHERE completed = false ORDER BY order_id ASC;
		`)
	}

	queryFiles := fmt.Sprintf(`
		SELECT file_name FROM files WHERE order_id = $1
	`)

	queryComments := fmt.Sprintf(`
		SELECT comment_text FROM comments WHERE order_id = $1
	`)

	queryRoutes := fmt.Sprintf(`
		SELECT *
	   FROM routes
	  WHERE order_id = $1
	`)

	queryRouteComments := fmt.Sprintf(`
		SELECT date, value
		  FROM route_comments
		 WHERE route_id = $1
	`)

	var err error

	var orders []*domain.Order
	err = o.db.Select(&orders, query)
	//check := make(chan bool)
	for _, order := range orders {
		//go o.getOrderSubInfo(order, queryFiles, queryComments, queryRoutes, queryRouteComments, queryRouteIssued, &err, check)
		//fmt.Println(<-check)

		err = o.db.Select(&order.Files, queryFiles, order.ID)
		err = o.db.Select(&order.Comments, queryComments, order.ID)
		err = o.db.Select(&order.DbRoutes, queryRoutes, order.ID)
		for _, route := range order.DbRoutes {
			err = o.db.Select(&route.Comments, queryRouteComments, route.RouteID)
		}
	}

	log.Info().Msg("RETURNING orders")
	return orders, err
}

func (o *OrdersPG) getOrderSubInfo(order *domain.Order, queryFiles, queryComments, queryRoutes, queryRouteComments, queryRouteIssued string, outErr *error, check chan bool) {
	err := o.db.Select(&order.Files, queryFiles, order.ID)
	err = o.db.Select(&order.Comments, queryComments, order.ID)
	err = o.db.Select(&order.DbRoutes, queryRoutes, order.ID)
	for _, route := range order.DbRoutes {
		err = o.db.Select(&route.Comments, queryRouteComments, route.RouteID)
	}
	log.Info().Interface("order", order.ID).Msg("check order")

	check <- true
	*outErr = err
}

func NewOrdersPG(db *sqlx.DB) *OrdersPG {
	return &OrdersPG{db: db}
}

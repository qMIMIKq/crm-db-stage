package repository

import (
	"crm/internal/domain"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"strings"
	"time"
)

type OrdersPG struct {
	db        *sqlx.DB
	reportsPG *ReportsPG
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
	layout := "2006-01-02"
	today := time.Now().Format(layout)

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
													issued, start_time, end_time, pause_time, error_time, 
													error_value, day_quantity, theor_end, dyn_end, plan_date, 
 												  plan_start, plan_faster, plan_exclude_days, last_comment, plan_dates)
						 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
			RETURNING route_id
		`)

		routeCommentsQuery := fmt.Sprintf(`
			INSERT INTO route_comments (route_id, date, value) VALUES ($1, $2, $3)
		`)

		routesCheck := fmt.Sprintf(`
				SELECT route_id, route_position FROM routes WHERE order_id = $1 AND route_position = $2 LIMIT 1
			`)

		routesUpdateQuery := fmt.Sprintf(`
				UPDATE routes SET worker = $1, plot_id = $2, quantity = $3,
						   issued = $4, start_time = $5, end_time = $6,
							 pause_time = $7, error_time = $8, error_value = $9, day_quantity = $10, 
							 theor_end = $11, dyn_end = $12, plan_date = $13, plan_start = $14,
							 plan_faster = $15, plan_exclude_days = $16, last_comment = $17, plan_dates = $18
			   WHERE order_id = $19 AND route_position = $20
				RETURNING route_id
			`)

		//planUpdateQuery := fmt.Sprintf(`
		//	UPDATE plans
		//		 SET route_plot = $1, divider = $2, queues = $3
		//	 WHERE route_id = $4 AND plan_date = $5
		//`)

		err = o.reportsPG.RemoveForUpdateReports(order.ID)
		for name, route := range order.Routes {
			var routeID int
			routePos := strings.Split(name, "-")[1]

			var dbRoutePos []domain.CheckRoute
			err = o.db.Select(&dbRoutePos, routesCheck, order.ID, routePos)

			log.Info().Interface("route", route.AddedDates).Msg("CHECK")
			if len(dbRoutePos) > 0 {
				var planDates []string
				for _, info := range route.AddedDates {
					planDates = append(planDates, info.Date)
				}

				log.Info().Caller().Msgf("INFO %v, %v, %v", planDates, order.ID, route.Plot)

				err = o.db.QueryRow(routesUpdateQuery, route.User, route.Plot,
					route.Quantity, route.Issued, route.StartTime, route.EndTime,
					route.PauseTime, route.ErrorTime, route.ErrorMsg, route.DayQuantity,
					route.TheorEnd, route.DynEnd, route.PlanDate, route.PlanStart, route.PlanFaster,
					route.PlanExcludeDays, route.LastComment, strings.Join(planDates, ", "), order.ID, routePos).Scan(&routeID)
				if err != nil {
					log.Err(err).Caller().Msg("Error")
				}

				planQuery := fmt.Sprintf(`
					INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
							 VALUES ($1, $2, $3, $4, $5, $6)
				`)

				reportQuery := fmt.Sprintf(`
					INSERT INTO reports 
								 (report_date, order_id, order_number, order_client, order_name, quantity, issued, plan, operator, issued_plan, order_material, order_plot, adding_date, route_position, route_id)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
				`)

				_, err = o.db.Exec("DELETE FROM plans WHERE route_id = $1 AND plan_date >= $2", dbRoutePos[0].RouteID, today)
				for _, info := range route.AddedDates {
					log.Info().Caller().Msgf("Date is %v", info.Date)
					_, err := o.db.Exec(planQuery, routeID, order.ID, route.Plot, info.Date, info.DateInfo.Divider, strings.Join(info.DateInfo.Queues, ", "))
					if err != nil {
						log.Err(err).Caller().Msg("ERROR")
					}

					var issuedToday string
					if today == info.Date {
						issuedToday = route.IssuedToday
					} else {
						issuedToday = "0"
					}

					_, err = o.db.Exec(
						reportQuery, info.Date, order.ID, order.Number, order.Client,
						order.Name, route.Quantity, route.Issued, route.DayQuantity,
						route.User, issuedToday, order.Material, route.Plot, today, routePos, route.RouteID,
					)
					if err != nil {
						log.Err(err).Caller().Msg("ERROR")
					}
				}

				_, err = o.db.Exec("DELETE FROM route_comments WHERE route_id = $1", dbRoutePos[0].RouteID)
				for _, comment := range route.Comments {
					if len(comment.Date) > 0 {
						_, err = o.db.Exec(routeCommentsQuery, dbRoutePos[0].RouteID, comment.Date, comment.Value)
					}
				}
				err = o.reportsPG.AddReports(route, order, order.ID, routePos, routeID, false)
			} else {
				var planDates []string
				for _, info := range route.AddedDates {
					planDates = append(planDates, info.Date)
				}

				err = o.db.QueryRow(routesQuery, order.ID,
					routePos, route.User, route.Plot,
					route.Quantity, route.Issued, route.StartTime, route.EndTime, route.PauseTime, route.ErrorTime,
					route.ErrorMsg, route.DayQuantity, route.TheorEnd, route.DynEnd, route.PlanDate, route.PlanStart,
					route.PlanFaster, route.PlanExcludeDays, route.LastComment, strings.Join(planDates, ", ")).Scan(&routeID)
				if err != nil {
					log.Err(err).Caller().Msg("ERROR")
				}

				planQuery := fmt.Sprintf(`
					INSERT INTO plans (route_id, order_id, route_plot, plan_date, divider, queues)
							 VALUES ($1, $2, $3, $4, $5, $6)
				`)

				reportQuery := fmt.Sprintf(`
					INSERT INTO reports 
								 (report_date, order_id, order_number, order_client, order_name, quantity, issued, plan, operator, issued_plan, order_material, order_plot, adding_date, route_position, route_id)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
				`)

				for _, info := range route.AddedDates {
					_, err := o.db.Exec(planQuery, routeID, order.ID, route.Plot, info.Date, info.DateInfo.Divider, strings.Join(info.DateInfo.Queues, ", "))
					if err != nil {
						log.Err(err).Caller().Msg("ERROR")
					}

					var issuedToday string
					if today == info.Date {
						issuedToday = route.IssuedToday
					} else {
						issuedToday = "0"
					}

					_, err = o.db.Exec(
						reportQuery, info.Date, order.ID, order.Number, order.Client,
						order.Name, route.Quantity, route.Issued, route.DayQuantity,
						route.User, issuedToday, order.Material, route.Plot, today, routePos, route.RouteID,
					)
					if err != nil {
						log.Err(err).Caller().Msg("ERROR")
					}
				}

				//err = o.reportsPG.AddReports(route, order, order.ID, routePos, routeID, false)
				//if err != nil {
				//	log.Err(err).Caller().Msg("ERROR")
				//}
				for _, comment := range route.Comments {
					if len(comment.Date) > 0 {
						_, err = o.db.Exec(routeCommentsQuery, routeID, comment.Date, comment.Value)
						if err != nil {
							log.Err(err).Caller().Msg("ERROR")
						}
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
													issued, start_time, end_time, pause_time, error_time, 
													error_value, day_quantity, theor_end, dyn_end, plan_date, 
													plan_start, plan_faster, plan_exclude_days, last_comment, plan_dates)
						 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
			RETURNING route_id
		`)

	routeCommentsQuery := fmt.Sprintf(`
			INSERT INTO route_comments (route_id, date, value) VALUES ($1, $2, $3)
	`)

	var files []string

	var err error
	var id string
	for _, order := range orders {
		if order.EndTime != "" {
			err = o.db.QueryRow(orderQuery, order.Number, order.Sample, order.Client,
				order.Name, order.Material, order.Quantity, order.Issued, order.M, order.EndTime, order.OTK, order.P).Scan(&id)
		} else {
			err = o.db.QueryRow(orderQuery, order.Number, order.Sample, order.Client,
				order.Name, order.Material, order.Quantity, order.Issued, order.M, nil, order.OTK, order.P).Scan(&id)
		}

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
			log.Info().Interface("route", route.AddedDates).Msg("CHECK")

			var planDates []string
			for _, info := range route.AddedDates {
				log.Info().Interface("date", info.Date).Msg("plan date")
				log.Info().Interface("info", info.DateInfo).Msg("plan info")

				planDates = append(planDates, info.Date)
			}

			log.Info().Interface("all plan dates", planDates).Msg("plan info dates")

			err = o.db.QueryRow(routesQuery, id,
				routePos, route.User, route.Plot,
				route.Quantity, route.Issued, route.StartTime, route.PauseTime,
				route.EndTime, route.ErrorTime, route.ErrorMsg, route.DayQuantity,
				route.TheorEnd, route.DynEnd, route.PlanDate, route.PlanStart, route.PlanFaster,
				route.PlanExcludeDays, route.LastComment, strings.Join(planDates, ", ")).Scan(&routeID)

			log.Info().Caller().Msgf("ROUTE ID %v", routeID)

			if len(route.PlanDate) > 0 {
				err = o.reportsPG.AddReports(route, order, id, routePos, routeID, true)
			}

			if err != nil {
				log.Err(err).Msg("error is")
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

func (o OrdersPG) GetOrders(params domain.GetOrder) ([]*domain.Order, error) {
	log.Info().Msg("Getting orders")

	var query string
	if params.Old {
		query = fmt.Sprintf(`
			SELECT * FROM orders 
       WHERE completed = true 
 						 AND order_endtime >= $1
						 AND order_endtime <= $2
		   ORDER BY order_id ASC;
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
     ORDER BY comment_id
	`)

	queryRouteIssuedToday := fmt.Sprintf(`
		SELECT issued_plan
      FROM reports
     WHERE route_id = $1 AND report_date = $2
	`)

	queryRoutePlan := fmt.Sprintf(`
		SELECT plan_date, divider, queues
		  FROM plans
     WHERE route_id = $1
		 ORDER BY plan_date
	`)

	queryRouteBusyPlan := fmt.Sprintf(`
		SELECT plan_date, divider, queues
		  FROM plans
     WHERE route_plot = $1 AND plan_date >= $2 AND route_id != $3
		 ORDER BY plan_date
	`)

	var err error

	var orders []*domain.Order

	if params.Old {
		err = o.db.Select(&orders, query, params.ArchiveFrom, params.ArchiveTo)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}

	} else {
		err = o.db.Select(&orders, query)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
	}

	today := time.Now().Format("2006-01-02")
	//check := make(chan bool)
	for _, order := range orders {
		//go o.getOrderSubInfo(order, queryFiles, queryComments, queryRoutes, queryRouteComments, queryRouteIssued, &err, check)
		//fmt.Println(<-check)

		err = o.db.Select(&order.Files, queryFiles, order.ID)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
		err = o.db.Select(&order.Comments, queryComments, order.ID)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
		err = o.db.Select(&order.DbRoutes, queryRoutes, order.ID)
		if err != nil {
			log.Err(err).Caller().Msg("error is")
		}
		for _, route := range order.DbRoutes {
			err = o.db.Select(&route.Comments, queryRouteComments, route.RouteID)
			if err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			o.db.Get(&route.IssuedToday, queryRouteIssuedToday, route.RouteID, today)

			err = o.db.Select(&route.DBPlanDates, queryRoutePlan, route.RouteID)
			if err != nil {
				log.Err(err).Caller().Msg("error is")
			}

			for _, dateInfo := range route.DBPlanDates {
				var newAdded domain.DateInfo

				newAdded.Date = dateInfo.PlanDate
				newAdded.DateInfo.Divider = dateInfo.Divider
				newAdded.DateInfo.Queues = strings.Split(dateInfo.Queues, ", ")

				route.AddedDates = append(route.AddedDates, newAdded)
			}

			log.Info().Interface("ADDED DATES", route.AddedDates).Msg("ADDED DATES")
			err = o.db.Select(&route.BusyDates, queryRouteBusyPlan, route.Plot, today, route.RouteID)
			if err != nil {
				log.Err(err).Caller().Msg("error is")
			}
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

func NewOrdersPG(db *sqlx.DB, reportsPg *ReportsPG) *OrdersPG {
	return &OrdersPG{db: db, reportsPG: reportsPg}
}

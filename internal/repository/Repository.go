package repository

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"mime/multipart"
)

type Init interface {
	InitDB() error
}

type Authorization interface {
	GetUser(user domain.UserAuth) (domain.UserInfo, error)
}

type Users interface {
	GetUsers() ([]domain.UserInfo, error)
	GetAllUsers() (domain.Users, error)
	GetUsersByGroupAndPlot(user domain.UserInfo) ([]domain.UserInfo, error)
	GetUsersByGroup(group string) ([]domain.UserInfo, error)
	GetOperators() ([]domain.UserInfo, error)
	GetManagers() ([]domain.UserInfo, error)
	GetUserByID(id string) (domain.UserInfo, error)
	CreateUser(user domain.UserInfo) (int, error)
	EditUser(user domain.UserInfo) error
	DeleteUser(userID string) error
}

type Filters interface {
	GetFilters(hidden bool) ([]domain.FilterInfo, error)
	GetFilterByID(filterId string) (domain.FilterInfo, error)
	CreateFilter(filter domain.FilterInfo) (int, error)
	EditFilter(filter domain.FilterInfo) error
	UpdatePosition(filters []domain.FilterInfo) error
	DeleteFilter(filterID string) error
}

type Plots interface {
	GetPlots() ([]domain.Plot, error)
	GetPlotByID(plotId string) (domain.Plot, error)
	CreatePlot(plot domain.Plot) (int, error)
	EditPlot(plot domain.Plot) error
	DeletePlot(plotID string) error
}

type Files interface {
	SaveFiles(c *gin.Context, dataFiles *multipart.Form) ([]string, error)
	RemoveFile(orderID string, fileName string) error
}

type Orders interface {
	GetOrders(params domain.GetOrder) ([]*domain.Order, error)
	DeleteOrderByID(id int) error
	AddOrders(orders []*domain.Order) error
	UpdateOrders(orders []*domain.Order) error
}

type Routes interface {
	DeleteRoute(routeID string) error
	GetRouteByID(id int) *domain.Route
	UpdateRoute(route *domain.Route) error
}

type Reports interface {
	GetAll(reportParams domain.ReportTime) ([]domain.Report, error)
	UpdateReports(report domain.Route) error
	AddReports(route *domain.Route, order *domain.Order, id, routePos string, routeID int, new bool) error
}

type Plans interface {
	GetBusy(plot, routeId string) ([]domain.DbPlanInfo, error)
	UpdatePlan(data *domain.PlanData) error
	ShiftPlan(shift *domain.PlanShift) error
	AutoShiftPlan(shift *domain.PlanShift) error
	ShiftPlanAfterEnd(route *domain.Route) error
}

type Groups interface {
	GetGroups() ([]domain.Group, error)
	GetGroupByID(groupID string) (domain.Group, error)
	EditGroup(group domain.Group) error
}

type Planning interface {
	CreatePlanningObject(route *domain.Route, order *domain.Order, id, routePos string, routeID int, new bool) (int, error)
	GetAllPlanning(planningRange *domain.PlanningRange) ([]*domain.Planning, error)
}

type TimeReports interface {
	CreateTimeData(dateReportInfo *DateTimeInfo, comment domain.Comment) string
	GetTimeReports(datesRange *domain.ReportTime) []domain.TimeReportPlot
}

type TimeRepos interface {
	CalcTheoreticTime(timeInfo domain.TimeInfo) (string, float64, [2]float64)
	CalcDynamicTime(time domain.TimeInfo) string
}

type Repository struct {
	Plans
	Init
	Authorization
	Filters
	Orders
	Plots
	Groups
	Routes
	Users
	Files
	Reports
	Planning
	TimeReports
	TimeRepos
}

func NewRepository(db *sqlx.DB) *Repository {
	ReportPG := NewReportsPG(db)
	PlansPG := NewPlansPG(db, ReportPG)
	PlanningPG := NewPlanningPG(db, PlansPG)
	RoutesPG := NewRoutesPG(db, ReportPG, PlanningPG)
	TimeReportsPG := NewTimeReportsPG(db)
	OrdersPG := NewOrdersPG(db, ReportPG, PlanningPG, TimeReportsPG)

	return &Repository{
		Authorization: NewAuthPG(db),
		Users:         NewUsersPG(db),
		Filters:       NewFiltersPG(db),
		Plots:         NewPlotsPG(db),
		Files:         NewFilesMwPg(db),
		Orders:        OrdersPG,
		Routes:        RoutesPG,
		Init:          NewInitPG(db),
		Reports:       NewReportsPG(db),
		Plans:         PlansPG,
		Planning:      PlanningPG,
		Groups:        NewGroupsPG(db),
		TimeReports:   TimeReportsPG,
		TimeRepos:     NewTimeRepo(),
	}

	//return &Repository{
	//	Authorization: NewAuthPG(db),
	//	Users:         NewUsersPG(db),
	//	Filters:       NewFiltersPG(db),
	//	Plots:         NewPlotsPG(db),
	//	Files:         NewFilesMwPg(db),
	//	Orders:        NewOrdersPG(db, ReportPG, NewPlanningPG(db, NewPlansPG(db, NewReportsPG(db)))),
	//	Routes:        NewRoutesPG(db, NewReportsPG(db), NewPlanningPG(db, NewPlansPG(db, NewReportsPG(db)))),
	//	Init:          NewInitPG(db),
	//	Reports:       NewReportsPG(db),
	//	Plans:         NewPlansPG(db, NewReportsPG(db)),
	//	Planning:      NewPlanningPG(db, NewPlansPG(db, NewReportsPG(db))),
	//	Groups:        NewGroupsPG(db),
	//}
}

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
	GetUsersByGroupAndPlot(user domain.UserInfo) ([]domain.UserInfo, error)
	GetUsersByGroup(group string) ([]domain.UserInfo, error)
	GetOperators() ([]domain.UserInfo, error)
}

type Filters interface {
	GetFilters() ([]domain.FilterInfo, error)
}

type Plots interface {
	GetPlots() ([]domain.Plot, error)
}

type Files interface {
	SaveFiles(c *gin.Context, files []*multipart.FileHeader) ([]string, error)
	RemoveFile(orderID string, fileName string) error
}

type Orders interface {
	GetOrders(old bool) ([]*domain.Order, error)
	DeleteOrderByID(id int) error
	AddOrders(orders []*domain.Order) error
	UpdateOrders(orders []*domain.Order) error
}

type Routes interface {
	DeleteRoute(routeID string) error
}

type Reports interface {
	GetAll(from, to string) ([]domain.Report, error)
	UpdateReports(report domain.Route) error
	AddReports(route *domain.Route, order *domain.Order, id, routePos string, routeID int, new bool) error
}

type Repository struct {
	Init
	Authorization
	Filters
	Orders
	Plots
	Routes
	Users
	Files
	Reports
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Authorization: NewAuthPG(db),
		Users:         NewUsersPG(db),
		Filters:       NewFiltersPG(db),
		Plots:         NewPlotsPG(db),
		Files:         NewFilesMwPg(db),
		Orders:        NewOrdersPG(db, NewReportsPG(db)),
		Routes:        NewRoutesPG(db),
		Init:          NewInitPG(db),
		Reports:       NewReportsPG(db),
	}
}

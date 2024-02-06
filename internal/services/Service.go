package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
	"github.com/gin-gonic/gin"
	"mime/multipart"
)

type Authorization interface {
	GetUser(user domain.UserAuth) (domain.UserInfo, error)
}

type Plots interface {
	GetPlotByID(plotId string) (domain.Plot, error)
	GetPlots() ([]domain.Plot, error)
	CreatePlot(plot domain.Plot) (int, error)
	EditPlot(plot domain.Plot) error
	DeletePlot(plotID string) error
}

type Filters interface {
	GetFilters(hidden bool) ([]domain.FilterInfo, error)
	GetFilterByID(filterId string) (domain.FilterInfo, error)
	CreateFilter(filter domain.FilterInfo) (int, error)
	EditFilter(filter domain.FilterInfo) error
	UpdatePosition(filters []domain.FilterInfo) error
	DeleteFilter(filterID string) error
}

type Users interface {
	GetUsers() ([]domain.UserInfo, error)
	GetAllUsers() (domain.Users, error)
	GetOperators() ([]domain.UserInfo, error)
	GetManagers() ([]domain.UserInfo, error)
	GetUsersByGroupAndPlot(user domain.UserInfo) ([]domain.UserInfo, error)
	GetUserByID(id string) (user domain.UserInfo, err error)
	CreateUser(user domain.UserInfo) (int, error)
	EditUser(user domain.UserInfo) error
	DeleteUser(userID string) error
}

type Files interface {
	SaveFiles(c *gin.Context, files []*multipart.FileHeader) ([]string, error)
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

type Time interface {
	CalcTheoreticTime(timeInfo domain.TimeInfo) (string, float64, [2]float64)
	CalcDynamicTime(time domain.TimeInfo) string
}

type Reports interface {
	GetAll(from, to string) ([]domain.Report, error)
	UpdateReports(report domain.Route) error
}

type Plans interface {
	GetBusy(plot, routeId string) ([]domain.DbPlanInfo, error)
	UpdatePlan(data *domain.PlanData) error
	ShiftPlan(shift *domain.PlanShift) error
	AutoShiftPlan(shift *domain.PlanShift) error
}

type Groups interface {
	GetGroup(groupName string)
	GetGroups() ([]domain.Group, error)
	GetGroupByID(groupID string) (domain.Group, error)
	EditGroup(group domain.Group) error
}
type Planning interface {
	GetAllPlanning(planningRange *domain.PlanningRange) ([]*domain.Planning, error)
}

type Services struct {
	Groups
	Plans
	Routes
	Files
	Authorization
	Filters
	Plots
	Users
	Orders
	Time
	Reports
	Planning
}

func NewService(repos *repository.Repository) *Services {
	return &Services{
		Authorization: NewAuthService(repos.Authorization),
		Users:         NewUsersService(repos.Users),
		Filters:       NewFiltersService(repos.Filters),
		Plots:         NewPlotsService(repos.Plots),
		Files:         NewFilesService(repos.Files),
		Orders:        NewOrdersService(repos.Orders),
		Routes:        NewRoutesService(repos.Routes),
		Time:          NewTimeService(),
		Groups:        NewGroupsService(repos.Groups),
		Reports:       NewReportsService(repos.Reports),
		Plans:         NewPlansService(repos.Plans),
		Planning:      NewPlanningService(repos.Planning),
	}
}

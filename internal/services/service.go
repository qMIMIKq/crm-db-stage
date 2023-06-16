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
	GetPlots() ([]domain.Plot, error)
}

type Filters interface {
	GetFilters() ([]domain.FilterInfo, error)
}

type Users interface {
	GetUsers() ([]domain.UserInfo, error)
	GetOperators() ([]domain.UserInfo, error)
	GetUsersByGroupAndPlot(user domain.UserInfo) ([]domain.UserInfo, error)
}

type Files interface {
	SaveFiles(c *gin.Context, files []*multipart.FileHeader) ([]string, error)
}

type Orders interface {
	GetOrders() ([]*domain.Order, error)
	AddOrders(orders []*domain.Order) error
	UpdateOrders(orders []*domain.Order) error
}

type Services struct {
	Files
	Authorization
	Filters
	Plots
	Users
	Orders
}

func NewService(repos *repository.Repository) *Services {
	return &Services{
		Authorization: NewAuthService(repos.Authorization),
		Users:         NewUsersService(repos.Users),
		Filters:       NewFiltersService(repos.Filters),
		Plots:         NewPlotsService(repos.Plots),
		//Files:         NewFilesService(repos.Files),
		Orders: NewOrdersService(repos.Orders),
	}
}

package repository

import (
	"crm/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"gopkg.in/gographics/imagick.v3/imagick"
	"mime/multipart"
)

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
	GetOrders() ([]*domain.Order, error)
	AddOrders(orders []*domain.Order) error
	UpdateOrders(orders []*domain.Order) error
}

type Repository struct {
	Files
	Authorization
	Users
	Filters
	Plots
	Orders
}

func NewRepository(db *sqlx.DB, mw *imagick.MagickWand) *Repository {
	return &Repository{
		Authorization: NewAuthPG(db),
		Users:         NewUsersPG(db),
		Filters:       NewFiltersPG(db),
		Plots:         NewPlotsPG(db),
		Files:         NewFilesMW(db, mw),
		Orders:        NewOrdersPG(db),
	}
}

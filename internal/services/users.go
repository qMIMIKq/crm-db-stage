package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type UsersService struct {
	repo repository.Users
}

func (u UsersService) GetUsersByGroupAndPlot(user domain.UserInfo) ([]domain.UserInfo, error) {
	return u.repo.GetUsersByGroupAndPlot(user)
}

func (u UsersService) GetOperators() ([]domain.UserInfo, error) {
	return u.repo.GetOperators()
}

func (u UsersService) GetUsers() ([]domain.UserInfo, error) {
	return u.repo.GetUsers()
}

func NewUsersService(repo repository.Users) *UsersService {
	return &UsersService{repo: repo}
}

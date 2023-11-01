package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
	"crm/pkg/hasher"
)

type UsersService struct {
	repo repository.Users
}

func (u UsersService) EditUser(user domain.UserInfo) error {
	if len(user.Password) > 0 {
		user.Password = hasher.GeneratePasswordHash(user.Password, salt)
	}

	return u.repo.EditUser(user)
}

func (u UsersService) DeleteUser(userID string) error {
	return u.repo.DeleteUser(userID)
}

func (u UsersService) CreateUser(user domain.UserInfo) (int, error) {
	user.Password = hasher.GeneratePasswordHash(user.Password, salt)
	return u.repo.CreateUser(user)
}

func (u UsersService) GetUserByID(id string) (user domain.UserInfo, err error) {
	return u.repo.GetUserByID(id)
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

func (u UsersService) GetAllUsers() (domain.Users, error) {
	return u.repo.GetAllUsers()
}

func NewUsersService(repo repository.Users) *UsersService {
	return &UsersService{repo: repo}
}

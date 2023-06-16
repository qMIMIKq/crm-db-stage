package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
	"crm/pkg/hasher"
)

type AuthService struct {
	repo repository.Authorization
}

const salt = "asda312das"

func (a AuthService) GetUser(user domain.UserAuth) (domain.UserInfo, error) {
	user.Password = hasher.GeneratePasswordHash(user.Password, salt)
	return a.repo.GetUser(user)
}

func NewAuthService(repo repository.Authorization) *AuthService {
	return &AuthService{repo: repo}
}

package services

import "crm/internal/repository"

type RoutesService struct {
	repo repository.Routes
}

func (r RoutesService) DeleteRoute(routeID string) error {
	return r.repo.DeleteRoute(routeID)
}

func NewRoutesService(repo repository.Routes) *RoutesService {
	return &RoutesService{repo: repo}
}

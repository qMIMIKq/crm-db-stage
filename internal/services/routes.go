package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type RoutesService struct {
	repo repository.Routes
}

func (r RoutesService) UpdateRoute(route *domain.Route) error {
	return r.repo.UpdateRoute(route)
}

func (r RoutesService) GetRouteByID(id int) *domain.Route {
	return r.repo.GetRouteByID(id)
}

func (r RoutesService) DeleteRoute(routeID string) error {
	return r.repo.DeleteRoute(routeID)
}

func NewRoutesService(repo repository.Routes) *RoutesService {
	return &RoutesService{repo: repo}
}

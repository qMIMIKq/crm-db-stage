package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type FiltersService struct {
	repo repository.Filters
}

func (f FiltersService) GetFilters(hidden bool) ([]domain.FilterInfo, error) {
	return f.repo.GetFilters(hidden)
}

func (f FiltersService) UpdatePosition(filters []domain.FilterInfo) error {
	return f.repo.UpdatePosition(filters)
}

func (f FiltersService) EditFilter(filter domain.FilterInfo) error {
	return f.repo.EditFilter(filter)
}

func (f FiltersService) CreateFilter(filter domain.FilterInfo) (int, error) {
	return f.repo.CreateFilter(filter)
}

func (f FiltersService) GetFilterByID(filterId string) (domain.FilterInfo, error) {
	return f.repo.GetFilterByID(filterId)
}

func NewFiltersService(repo repository.Filters) *FiltersService {
	return &FiltersService{repo: repo}
}

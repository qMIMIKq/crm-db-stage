package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type FiltersService struct {
	repo repository.Filters
}

func (f FiltersService) GetFilters() ([]domain.FilterInfo, error) {
	return f.repo.GetFilters()
}

func NewFiltersService(repo repository.Filters) *FiltersService {
	return &FiltersService{repo: repo}
}

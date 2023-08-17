package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type ReportsService struct {
	repo repository.Reports
}

func (r ReportsService) GetAll(from, to string) ([]domain.Report, error) {
	return r.repo.GetAll(from, to)
}

func (r ReportsService) UpdateReports(route domain.Route) error {
	return r.repo.UpdateReports(route)
}

func NewReportsService(repo repository.Reports) *ReportsService {
	return &ReportsService{repo: repo}
}

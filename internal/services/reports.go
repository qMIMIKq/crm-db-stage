package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type ReportsService struct {
	repo repository.Reports
}

func (r ReportsService) GetAll(reportParams domain.ReportTime) ([]domain.Report, error) {
	return r.repo.GetAll(reportParams)
}

func (r ReportsService) UpdateReports(route domain.Route) error {
	return r.repo.UpdateReports(route)
}

func NewReportsService(repo repository.Reports) *ReportsService {
	return &ReportsService{repo: repo}
}

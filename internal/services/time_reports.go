package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type TimeReportsService struct {
	repo repository.TimeReports
}

func (t *TimeReportsService) GetTimeReports() []domain.TimeReportPlot {
	return t.repo.GetTimeReports()
}

func NewTimeReportsService(repo repository.TimeReports) *TimeReportsService {
	return &TimeReportsService{repo: repo}
}

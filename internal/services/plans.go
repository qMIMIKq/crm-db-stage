package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type PlansService struct {
	repo repository.Plans
}

func (p PlansService) GetBusy(plot string) ([]domain.DbPlanInfo, error) {
	return p.repo.GetBusy(plot)
}

func NewPlansService(repo repository.Plans) *PlansService {
	return &PlansService{repo: repo}
}

package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type PlansService struct {
	repo repository.Plans
}

func (p PlansService) UpdatePlan(data *domain.PlanData) error {
	return p.repo.UpdatePlan(data)
}

func (p PlansService) GetBusy(plot, routeId string) ([]domain.DbPlanInfo, error) {
	return p.repo.GetBusy(plot, routeId)
}

func NewPlansService(repo repository.Plans) *PlansService {
	return &PlansService{repo: repo}
}

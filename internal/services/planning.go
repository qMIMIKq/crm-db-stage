package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type PlanningService struct {
	repo repository.Planning
}

func (p *PlanningService) GetAllPlanning(planningRange *domain.PlanningRange) ([]*domain.Planning, error) {
	return p.repo.GetAllPlanning(planningRange)
}

func NewPlanningService(repo repository.Planning) *PlanningService {
	return &PlanningService{repo: repo}
}

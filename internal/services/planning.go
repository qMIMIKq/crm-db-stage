package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type PlanningService struct {
	repo repository.Planning
}

func (p *PlanningService) GetAllPlanning() ([]*domain.Planning, error) {
	return p.repo.GetAllPlanning()
}

func NewPlanningService(repo repository.Planning) *PlanningService {
	return &PlanningService{repo: repo}
}

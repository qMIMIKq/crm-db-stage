package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type PlotsService struct {
	repo repository.Plots
}

func (p PlotsService) GetPlots() ([]domain.Plot, error) {
	return p.repo.GetPlots()
}

func NewPlotsService(repo repository.Plots) *PlotsService {
	return &PlotsService{repo: repo}
}

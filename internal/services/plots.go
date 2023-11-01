package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type PlotsService struct {
	repo repository.Plots
}

func (p PlotsService) DeletePlot(plotID string) error {
	return p.repo.DeletePlot(plotID)
}

func (p PlotsService) EditPlot(plot domain.Plot) error {
	return p.repo.EditPlot(plot)
}

func (p PlotsService) GetPlotByID(plotId string) (domain.Plot, error) {
	return p.repo.GetPlotByID(plotId)
}

func (p PlotsService) CreatePlot(plot domain.Plot) (int, error) {
	return p.repo.CreatePlot(plot)
}

func (p PlotsService) GetPlots() ([]domain.Plot, error) {
	return p.repo.GetPlots()
}
func NewPlotsService(repo repository.Plots) *PlotsService {
	return &PlotsService{repo: repo}
}

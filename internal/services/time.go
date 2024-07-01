package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type TimeService struct {
	timeRepo repository.TimeRepos
}

func (t TimeService) CalcTheoreticTime(timeInfo domain.TimeInfo) (string, float64, [2]float64) {
	return t.timeRepo.CalcTheoreticTime(timeInfo)
}

func (t TimeService) CalcDynamicTime(time domain.TimeInfo) string {
	//TODO implement me
	panic("implement me")
}

func NewTimeService(timeRepo repository.TimeRepos) *TimeService {
	return &TimeService{timeRepo: timeRepo}
}

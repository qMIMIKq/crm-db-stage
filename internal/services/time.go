package services

import (
	"crm/internal/domain"
	"github.com/rs/zerolog/log"
	"strconv"
	"strings"
	"time"
)

type TimeService struct {
}

func (t TimeService) CalcTheoreticTime(timeInfo domain.TimeInfo) string {
	calc := EndTimeCalculator{
		Layout:                 "2006-01-02 15:04",
		WorkerStringStartTime:  timeInfo.Start,
		MachineStringStartTime: timeInfo.MachineStart,
		MachineStringEndTime:   timeInfo.MachineEnd,
		FullQuantity:           float64(timeInfo.Quantity),
		DayQuantity:            float64(timeInfo.DayQuantity),
		Issued:                 float64(timeInfo.Issued),
	}

	calc.WorkerFullStartTime = calc.createFullTime(calc.WorkerStringStartTime)
	workerStarted := strings.Split(calc.WorkerStringStartTime, " ")[1]
	calc.WorkerCalcStartTime = calc.createCalcTime(workerStarted)
	log.Info().Msgf("Full worker time %v", calc.WorkerFullStartTime)
	log.Info().Msgf("Calc worker time %v", calc.WorkerCalcStartTime)

	calc.MachineEndTime = calc.createCalcTime(calc.MachineStringEndTime)
	calc.MachineStartTime = calc.createCalcTime(calc.MachineStringStartTime)
	calc.MachineWorkingMinutes = calc.findWorkingMinutes(calc.MachineEndTime, calc.MachineStartTime)
	calc.setQuantityAtMinute()
	calc.findNeededTime()
	log.Info().Msgf("Needed time: %v", calc.NeededTime)

	calc.RestTime = time.Duration(-calc.findWorkingMinutes(calc.MachineStartTime, calc.MachineEndTime)/10*12) * time.Minute

	canWorkToday := calc.findWorkingMinutes(calc.MachineEndTime, calc.WorkerCalcStartTime)
	log.Info().Msgf("Can work today %v", canWorkToday)

	counter := 0
	for calc.NeededTime >= calc.MachineWorkingMinutes {
		if counter == 0 {
			calc.NeededTime -= canWorkToday
			calc.TheorEndTime = calc.WorkerFullStartTime.Add(time.Duration(canWorkToday/10*12) * time.Minute)
			endHours := strings.Split(calc.TheorEndTime.Format(calc.Layout), " ")[1]
			log.Info().Msgf("First day time needed %v", calc.NeededTime)
			log.Info().Msgf("First day time end %v", calc.TheorEndTime)

			if endHours == calc.MachineStringEndTime {
				calc.TheorEndTime = calc.TheorEndTime.Add(calc.RestTime)
			}

		} else {
			calc.NeededTime -= calc.MachineWorkingMinutes
			calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(calc.MachineWorkingMinutes/10*12) * time.Minute)
			endHours := strings.Split(calc.TheorEndTime.Format(calc.Layout), " ")[1]
			log.Info().Msgf("Next days day time needed %v", calc.NeededTime)
			log.Info().Msgf("Next days time end %v", calc.TheorEndTime)

			if endHours == calc.MachineStringEndTime {
				calc.TheorEndTime = calc.TheorEndTime.Add(calc.RestTime)
			}
		}

		counter++
	}

	if calc.NeededTime != 0 {
		log.Info().Msgf("Remaining time %v", calc.NeededTime)
		calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(calc.NeededTime/10*12) * time.Minute)
		calc.NeededTime -= calc.NeededTime
	}

	return calc.TheorEndTime.Format(calc.Layout)
}

func (t TimeService) CalcDynamicTime(timeInfo domain.TimeInfo) string {
	//TODO implement me
	panic("implement me")
}

func NewTimeService() *TimeService {
	return &TimeService{}
}

type EndTimeCalculator struct {
	Layout string

	WorkerStringStartTime string
	WorkerFullStartTime   time.Time
	WorkerCalcStartTime   time.Time
	TheorEndTime          time.Time

	MachineStringStartTime string
	MachineStartTime       time.Time
	MachineStringEndTime   string
	MachineEndTime         time.Time
	MachineWorkingMinutes  float64

	RestTime time.Duration

	FullQuantity     float64
	DayQuantity      float64
	QuantityAtMinute float64
	Issued           float64

	NeededTime float64
}

func (c *EndTimeCalculator) createCalcTime(stringTime string) time.Time {
	timeH, _ := strconv.Atoi(stringTime[:2])
	timeM, _ := strconv.Atoi(stringTime[3:])

	return time.Date(2000, 10, 23, timeH, timeM, 0, 0, time.Local)
}

func (c *EndTimeCalculator) createFullTime(stringTime string) time.Time {
	res, _ := time.Parse("2006-01-02 15:04", stringTime)
	return res
}

func (c *EndTimeCalculator) findWorkingMinutes(endTime time.Time, start time.Time) float64 {
	return float64((endTime.Unix()-start.Unix())/60) * 10 / 12
}

func (c *EndTimeCalculator) setQuantityAtMinute() {
	c.QuantityAtMinute = c.DayQuantity / c.MachineWorkingMinutes
}

func (c *EndTimeCalculator) findNeededTime() float64 {
	c.NeededTime = (c.FullQuantity / c.DayQuantity) * c.MachineWorkingMinutes
	return c.NeededTime
}

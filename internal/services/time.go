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
	var check bool
	checkH := stringTime[:2]
	if strings.Contains(checkH, ":") {
		checkH = "0" + checkH[:1]
		check = true
	}

	timeH, err := strconv.Atoi(checkH)
	if err != nil {
		log.Warn().Err(err).Caller().Msg("error")
	}

	var convMin string
	if check {
		convMin = stringTime[2:]
	} else {
		convMin = stringTime[3:]
	}

	timeM, err := strconv.Atoi(convMin)
	if err != nil {
		log.Warn().Err(err).Caller().Msg("error")
	}

	return time.Date(2000, 10, 23, timeH, timeM, 0, 0, time.Local)
}

func (c *EndTimeCalculator) createFullTime(stringTime string) time.Time {
	res, _ := time.Parse("2006-01-02 15:04", stringTime)
	return res
}

func (c *EndTimeCalculator) findWorkingMinutes(endTime time.Time, start time.Time) float64 {
	return float64((endTime.Unix() - start.Unix()) / 60)
}

func (c *EndTimeCalculator) setQuantityAtMinute() {
	c.QuantityAtMinute = c.DayQuantity / c.MachineWorkingMinutes
}

func (c *EndTimeCalculator) findNeededTime() float64 {
	c.NeededTime = (c.FullQuantity / c.DayQuantity) * c.MachineWorkingMinutes
	return c.NeededTime
}

func (t TimeService) CalcTheoreticTime(timeInfo domain.TimeInfo) (string, float64) {
	log.Info().Interface("time info", timeInfo).Msg("time info is")

	calc := EndTimeCalculator{
		Layout:                 "2006-01-02 15:04",
		WorkerStringStartTime:  strings.ReplaceAll(timeInfo.Start, ".", "-"),
		MachineStringStartTime: timeInfo.MachineStart,
		MachineStringEndTime:   timeInfo.MachineEnd,
		FullQuantity:           float64(timeInfo.Quantity),
		DayQuantity:            float64(timeInfo.DayQuantity),
		Issued:                 float64(timeInfo.Issued),
	}

	calc.WorkerFullStartTime = calc.createFullTime(calc.WorkerStringStartTime)
	workerStarted := strings.Split(calc.WorkerStringStartTime, " ")[1]
	calc.WorkerCalcStartTime = calc.createCalcTime(workerStarted)

	calc.MachineEndTime = calc.createCalcTime(calc.MachineStringEndTime)
	calc.MachineStartTime = calc.createCalcTime(calc.MachineStringStartTime)
	calc.MachineWorkingMinutes = calc.findWorkingMinutes(calc.MachineEndTime, calc.MachineStartTime)
	calc.setQuantityAtMinute()
	calc.findNeededTime()

	calc.RestTime = time.Duration(-calc.findWorkingMinutes(calc.MachineStartTime, calc.MachineEndTime)) * time.Minute

	var canWorkToday float64
	canWorkToday = calc.findWorkingMinutes(calc.MachineEndTime, calc.WorkerCalcStartTime)
	if calc.WorkerCalcStartTime.Unix() > calc.MachineStartTime.Unix() && calc.WorkerCalcStartTime.Unix() < calc.MachineEndTime.Unix() {
		canWorkToday = calc.findWorkingMinutes(calc.MachineEndTime, calc.WorkerCalcStartTime)
	} else {
		canWorkToday = 0
	}

	counter := 0
	for calc.NeededTime >= calc.MachineWorkingMinutes {
		if counter == 0 {
			calc.NeededTime -= canWorkToday
			if canWorkToday > 0 {
				calc.TheorEndTime = calc.WorkerFullStartTime.Add(time.Duration(canWorkToday) * time.Minute)
			} else {
				calc.TheorEndTime = calc.WorkerFullStartTime.Add(time.Duration(canWorkToday) * time.Minute)

				var err error
				calc.TheorEndTime, err = time.Parse(calc.Layout, strings.Split(calc.TheorEndTime.Format(calc.Layout), " ")[0]+" "+calc.MachineStringStartTime)
				if err != nil {
					log.Warn().Err(err).Caller().Msgf("error")
				}
			}

			endHours := strings.Split(calc.TheorEndTime.Format(calc.Layout), " ")[1]

			if endHours == calc.MachineStringEndTime {
				calc.TheorEndTime = calc.TheorEndTime.Add(calc.RestTime)
			}

		} else {
			calc.NeededTime -= calc.MachineWorkingMinutes
			calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(calc.MachineWorkingMinutes) * time.Minute)
			endHours := strings.Split(calc.TheorEndTime.Format(calc.Layout), " ")[1]
			endTimeHours := calc.createCalcTime(endHours)

			log.Info().Msgf("end hours %v || machine end %v", endTimeHours, calc.MachineEndTime)
			if endTimeHours.Unix() >= calc.MachineEndTime.Unix() {
				calc.TheorEndTime = calc.TheorEndTime.Add(calc.RestTime)
			}
		}

		log.Info().Msgf("Theor need on end one cycle %v", calc.TheorEndTime.Format(calc.Layout))
		counter++
	}

	if calc.NeededTime != 0 {
		calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(calc.NeededTime) * time.Minute)
		calc.NeededTime -= calc.NeededTime
	}

	log.Info().Msgf("Theor end %v", calc.TheorEndTime.Format(calc.Layout))
	calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(timeInfo.Up+timeInfo.Adjustment) * time.Minute)
	return calc.TheorEndTime.Format(calc.Layout), calc.TheorEndTime.Sub(calc.WorkerFullStartTime).Hours() / 24
}

func (t TimeService) CalcDynamicTime(timeInfo domain.TimeInfo) string {
	//TODO implement me
	panic("implement me")
}

func NewTimeService() *TimeService {
	return &TimeService{}
}

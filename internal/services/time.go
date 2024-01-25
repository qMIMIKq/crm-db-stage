package services

import (
	"crm/internal/domain"
	"github.com/rs/zerolog/log"
	"math"
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
	MachineWorkingSeconds  float64

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

func round(x float64) float64 {
	t := math.Trunc(x)
	if math.Abs(x-t) >= 0.5 {
		return t + math.Copysign(1, x)
	}
	return t
}

func (t TimeService) CalcTheoreticTime(timeInfo domain.TimeInfo) (string, float64, [2]float64) {
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
	calc.MachineWorkingSeconds = calc.MachineWorkingMinutes * 60
	calc.setQuantityAtMinute()
	//calc.findNeededTime()

	calc.RestTime = time.Duration(-calc.findWorkingMinutes(calc.MachineStartTime, calc.MachineEndTime)) * time.Minute

	log.Info().Caller().Interface("time info", timeInfo).Msgf("time info is")
	var inSecForDetail float64 = 0
	splitTime := strings.Split(timeInfo.Time, ".")
	if len(splitTime) > 1 {
		var right int
		left, _ := strconv.Atoi(splitTime[0])
		right, _ = strconv.Atoi(splitTime[1])

		if len(splitTime[1]) == 1 {
			right *= 10
		}

		inSecForDetail += float64(left*60 + right)
	} else {
		left, _ := strconv.Atoi(splitTime[0])
		inSecForDetail += float64(left * 60)
	}

	log.Info().Msgf("in sec for detail %v", inSecForDetail)
	calc.NeededTime = (float64(timeInfo.Quantity) * inSecForDetail) + (float64(timeInfo.Up+timeInfo.Adjustment) * 60) // Time for all job in seconds
	log.Info().Msgf("time for all working %v, machine working minutes %v", calc.NeededTime, calc.MachineWorkingSeconds)

	var canWorkTodayWithDetails float64
	var canWorkTodayTotal float64
	canWorkTodayWithDetails = calc.findWorkingMinutes(calc.MachineEndTime, calc.WorkerCalcStartTime)
	if calc.WorkerCalcStartTime.Unix() > calc.MachineStartTime.Unix() && calc.WorkerCalcStartTime.Unix() < calc.MachineEndTime.Unix() {
		canWorkTodayWithDetails = calc.findWorkingMinutes(calc.MachineEndTime, calc.WorkerCalcStartTime)
		canWorkTodayTotal = canWorkTodayWithDetails
		canWorkTodayWithDetails -= float64(timeInfo.Up + timeInfo.Adjustment)
	} else {
		canWorkTodayWithDetails = 0
		canWorkTodayTotal = canWorkTodayWithDetails
	}

	canWorkTodaySeconds := canWorkTodayWithDetails * 60
	canWorkTodayTotal *= 60
	canDoForFirstDay := math.Ceil(canWorkTodaySeconds / inSecForDetail)

	log.Info().Caller().Msgf("can work today in seconds %v / in sec for details %v, can do today in details %v", canWorkTodaySeconds, inSecForDetail, canDoForFirstDay)
	log.Info().Caller().Msgf("can work today total in seconds %v", canWorkTodayTotal)

	counter := 0
	if calc.NeededTime >= calc.MachineWorkingSeconds && calc.NeededTime >= canWorkTodayTotal {
		for calc.NeededTime >= calc.MachineWorkingSeconds {
			if counter == 0 {
				calc.NeededTime -= canWorkTodayTotal
				calc.TheorEndTime = calc.WorkerFullStartTime.Add(time.Duration(canWorkTodayTotal) * time.Second)
				calc.TheorEndTime = calc.TheorEndTime.Add(calc.RestTime)
				log.Info().Caller().Msgf("theor end %v", calc.TheorEndTime)

				if canWorkTodaySeconds > 0 {

				} else {

				}

			} else {
				calc.NeededTime -= calc.MachineWorkingSeconds
				calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(calc.MachineWorkingSeconds) * time.Second)
				calc.TheorEndTime = calc.TheorEndTime.Add(calc.RestTime)

				log.Info().Caller().Msgf("theor end %v", calc.TheorEndTime)
			}
			counter++
		}

		if calc.NeededTime != 0 {
			calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(calc.NeededTime) * time.Second)
			calc.NeededTime -= calc.NeededTime
			counter++
		}

		log.Info().Caller().Msgf("end counter %v, end time %v", counter, calc.TheorEndTime)

		if canDoForFirstDay > float64(timeInfo.Quantity) {
			canDoForFirstDay = float64(timeInfo.Quantity)
		}

		return calc.TheorEndTime.Format(calc.Layout), float64(counter), [2]float64{canDoForFirstDay, 0}
	} else {
		log.Info().Caller().Msgf("needed time smaller them working time")
		//counter++
		//calc.TheorEndTime = calc.WorkerFullStartTime.Add(time.Duration(calc.NeededTime) * time.Second)
		//log.Info().Caller().Msgf("end time %v", calc.TheorEndTime)

		var needToDoFirst float64
		if calc.NeededTime > canWorkTodayTotal {
			needToDoFirst = canWorkTodayTotal
		} else {
			needToDoFirst = calc.NeededTime
		}

		for calc.NeededTime > 0 {
			if counter == 0 {
				calc.NeededTime -= needToDoFirst
				calc.TheorEndTime = calc.WorkerFullStartTime.Add(time.Duration(needToDoFirst) * time.Second)

				if calc.NeededTime > 0 {
					calc.TheorEndTime = calc.TheorEndTime.Add(calc.RestTime)
				}

			} else {
				calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(calc.NeededTime) * time.Second)
				calc.NeededTime -= calc.NeededTime
			}

			counter++
		}

		if canDoForFirstDay > float64(timeInfo.Quantity) {
			canDoForFirstDay = float64(timeInfo.Quantity)
		}

		return calc.TheorEndTime.Format(calc.Layout), float64(counter), [2]float64{canDoForFirstDay, 0}
	}

	//canDoForFirstDay := round(canWorkTodaySeconds / inSecForDetail)

	//var canWorkTodayWithDetails float64
	//canWorkTodayWithDetails = calc.findWorkingMinutes(calc.MachineEndTime, calc.WorkerCalcStartTime)
	//if calc.WorkerCalcStartTime.Unix() > calc.MachineStartTime.Unix() && calc.WorkerCalcStartTime.Unix() < calc.MachineEndTime.Unix() {
	//	canWorkTodayWithDetails = calc.findWorkingMinutes(calc.MachineEndTime, calc.WorkerCalcStartTime)
	//} else {
	//	canWorkTodayWithDetails = 0
	//}
	//
	//canWorkTodaySeconds := canWorkTodayWithDetails * 60
	//
	//
	//
	//log.Info().Caller().Msgf("quantity %v, day quantity %v, can do first day %v", timeInfo.Quantity, timeInfo.DayQuantity, canDoForFirstDay)

	//counter := 0
	//for calc.NeededTime >= calc.MachineWorkingMinutes {
	//	if counter == 0 {
	//		calc.NeededTime -= canWorkTodayWithDetails
	//		if canWorkTodayWithDetails > 0 {
	//			calc.TheorEndTime = calc.WorkerFullStartTime.Add(time.Duration(canWorkTodayWithDetails) * time.Minute)
	//		} else {
	//			calc.TheorEndTime = calc.WorkerFullStartTime.Add(time.Duration(canWorkTodayWithDetails) * time.Minute)
	//
	//			var err error
	//			calc.TheorEndTime, err = time.Parse(calc.Layout, strings.Split(calc.TheorEndTime.Format(calc.Layout), " ")[0]+" "+calc.MachineStringStartTime)
	//			if err != nil {
	//				log.Warn().Err(err).Caller().Msgf("error")
	//			}
	//		}
	//
	//		endHours := strings.Split(calc.TheorEndTime.Format(calc.Layout), " ")[1]
	//
	//		if endHours == calc.MachineStringEndTime {
	//			calc.TheorEndTime = calc.TheorEndTime.Add(calc.RestTime)
	//		}
	//
	//	} else {
	//		calc.NeededTime -= calc.MachineWorkingMinutes
	//		calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(calc.MachineWorkingMinutes) * time.Minute)
	//		endHours := strings.Split(calc.TheorEndTime.Format(calc.Layout), " ")[1]
	//		endTimeHours := calc.createCalcTime(endHours)
	//
	//		log.Info().Msgf("end hours %v || machine end %v", endTimeHours, calc.MachineEndTime)
	//		if endTimeHours.Unix() >= calc.MachineEndTime.Unix() {
	//			calc.TheorEndTime = calc.TheorEndTime.Add(calc.RestTime)
	//		}
	//	}
	//
	//	log.Info().Msgf("Theor need on end one cycle %v", calc.TheorEndTime.Format(calc.Layout))
	//	counter++
	//}
	//
	//if calc.NeededTime != 0 {
	//	calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(calc.NeededTime) * time.Minute)
	//	calc.NeededTime -= calc.NeededTime
	//	counter++
	//}
	//
	////log.Info().Msgf("Theor end %v", calc.TheorEndTime.Format(calc.Layout))
	//calc.TheorEndTime = calc.TheorEndTime.Add(time.Duration(timeInfo.Up+timeInfo.Adjustment) * time.Minute)
	//calcedEnd := calc.createCalcTime(strings.Split(calc.TheorEndTime.Format(calc.Layout), " ")[1])
	//check := float64(calcedEnd.Unix() - calc.MachineStartTime.Unix())
	//canDoLastDay := round(check / inSecForDetail)
	//log.Info().Msgf("CHECK TIME! %v", counter)
	//
	//log.Info().Caller().Msgf("end time %v", calc.TheorEndTime.Format(calc.Layout))
	//return calc.TheorEndTime.Format(calc.Layout), calc.TheorEndTime.Sub(calc.WorkerFullStartTime).Hours() / 24, [2]float64{canDoForFirstDay, canDoLastDay}
	//return calc.TheorEndTime.Format(calc.Layout), float64(counter), [2]float64{canDoForFirstDay, canDoLastDay}
	//return "", 32, [2]float64{15, 22}
}

func (t TimeService) CalcDynamicTime(timeInfo domain.TimeInfo) string {
	//TODO implement me
	panic("implement me")
}

func NewTimeService() *TimeService {
	return &TimeService{}
}

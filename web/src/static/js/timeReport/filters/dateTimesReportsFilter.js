import {getTime} from "../../modules/getTime";
import {getTimeReports} from "../getTimeReports";

export const reportRoutesDatesFilter = () => {
  const filterBtn = document.querySelector('.header-routes__planned--report')
  const filterDateFrom = document.querySelector('.header-routes__planned-date--report__from')
  const filterDateTo = document.querySelector('.header-routes__planned-date--report__to')
  const refreshDataBtn = document.querySelector('.report-refresh')

  let today = getTime()
  today = today.substring(0, today.length - 5).trim()
  let yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday = yesterday.toLocaleDateString('ru-RU', {timeZone: 'Europe/Moscow'}).split('.')
  yesterday = yesterday.reverse().join('-')

  // const recreatePlansTable = () => {
  //   deleteOrders()
  //   let startDate = new Date(filterDateFrom.value)
  //   let endDate = new Date(filterDateTo.value)
  //   endDate.setDate(endDate.getDate() + 1)
  //
  //   let res = getDays(startDate, endDate)
  //
  //   state.orders.forEach(plan => {
  //     console.log(plan)
  //     drawPlan(plan)
  //   })
  //
  //   document.querySelector('.table__route--date').style.minWidth = `${res * 95}px`
  // }

  filterDateFrom.value = yesterday
  filterDateTo.value = today
  filterDateTo.setAttribute('min', String(yesterday))

  filterDateFrom.addEventListener('change', () => {
    filterDateTo.setAttribute('min', String(filterDateFrom.value))

    if (new Date(filterDateFrom.value).getTime() >= new Date(filterDateTo.value).getTime()) {
      filterDateTo.value = filterDateFrom.value
    }
    getTimeReports()
  })

  filterDateTo.addEventListener('change', () => {
    getTimeReports()
  })

  refreshDataBtn.addEventListener('click', () => {
    getTimeReports()
  })
}
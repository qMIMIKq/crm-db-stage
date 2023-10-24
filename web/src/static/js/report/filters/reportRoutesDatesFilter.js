import {getTime} from "../../modules/getTime";
import {getReports} from "../getReports";
import {deleteOrders} from "../../modules/getOrders";
import {drawPlan, getDays} from "../../plan/drawPlan";
import {state} from "../../modules/state";

export const reportRoutesDatesFilter = () => {
  const filterBtn = document.querySelector('.header-routes__planned--report')
  const filterDateFrom = document.querySelector('.header-routes__planned-date--report__from')
  const filterDateTo = document.querySelector('.header-routes__planned-date--report__to')

  let today = getTime()
  today = today.substring(0, today.length - 5).trim()

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

  filterDateFrom.value = today.trim()
  filterDateTo.value = today.trim()
  filterDateTo.setAttribute('min', String(today.trim()))

  filterDateFrom.addEventListener('change', () => {
    filterDateTo.setAttribute('min', String(filterDateFrom.value))

    if  (new Date(filterDateFrom.value).getTime() >= new Date(filterDateTo.value).getTime()) {
      filterDateTo.value = filterDateFrom.value
    }
    getReports()
  })

  filterDateTo.addEventListener('change', () => {
    getReports()
  })

  filterBtn.addEventListener('click', () => {
    getReports()
  })
}
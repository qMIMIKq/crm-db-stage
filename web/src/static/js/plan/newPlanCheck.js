import {getTime} from "../modules/getTime";
import {state} from "../modules/state";
import {drawPlan, getDays} from "./drawPlan";
import {deleteOrders} from "../modules/getOrders";

export const reportPlanningDatesFilter = () => {
  const filterBtn = document.querySelector('.header-routes__planned--report')
  const filterDateFrom = document.querySelector('.header-routes__planned-date--report__from')
  const filterDateTo = document.querySelector('.header-routes__planned-date--report__to')

  let today = getTime()
  today = today.substring(0, today.length - 5).trim()

  filterDateFrom.value = today.trim()
  filterDateTo.value = today.trim()
  let check = new Date(filterDateTo.value)
  check.setDate(check.getDate() + 30)
  filterDateTo.value = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`
  filterDateTo.setAttribute('min', String(today.trim()))
  filterDateFrom.setAttribute('min', String(today.trim()))

  const recreatePlansTable = () => {
    deleteOrders()
    let startDate = new Date(filterDateFrom.value)
    let endDate = new Date(filterDateTo.value)
    endDate.setDate(endDate.getDate() + 1)

    let res = getDays(startDate, endDate)

    state.orders.forEach(plan => {
      console.log(plan)
      drawPlan(plan)
    })

    document.querySelector('.table__route--date').style.minWidth = `${res * 95}px`
  }

  filterDateFrom.addEventListener('change', () => {
    filterDateTo.setAttribute('min', String(filterDateFrom.value))

    if  (new Date(filterDateFrom.value).getTime() >= new Date(filterDateTo.value).getTime()) {
      filterDateTo.value = filterDateFrom.value
    }

    recreatePlansTable()
  })

  filterDateTo.addEventListener('change', () => {
    recreatePlansTable()
  })

  // filterBtn.addEventListener('click', () => {
  //
  // })
}
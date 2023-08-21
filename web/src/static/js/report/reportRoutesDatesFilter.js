import {getTime} from "../modules/getTime";
import {getReports} from "./getReports";

export const reportRoutesDatesFilter = () => {
  const filterBtn = document.querySelector('.header-routes__planned--report')
  const filterDateFrom = document.querySelector('.header-routes__planned-date--report__from')
  const filterDateTo = document.querySelector('.header-routes__planned-date--report__to')

  let today = getTime()
  today = today.substring(0, today.length - 5).trim()

  filterDateFrom.value = today.trim()
  filterDateTo.value = today.trim()
  filterDateTo.setAttribute('min', String(today.trim()))

  filterDateFrom.addEventListener('change', () => {
    filterDateTo.setAttribute('min', String(filterDateFrom.value))
    filterDateTo.value = filterDateFrom.value
  })

  filterBtn.addEventListener('click', () => {
    getReports()
  })
}
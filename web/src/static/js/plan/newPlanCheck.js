import {getTime} from "../modules/getTime";
import {state} from "../modules/state";
import {drawPlan} from "./drawPlan";
import {deleteOrders} from "../modules/getOrders";

export const reportPlanningDatesFilter = () => {
  const filterBtn = document.querySelector('.header-routes__planned--report')
  const filterDateFrom = document.querySelector('.header-routes__planned-date--report__from')
  const filterDateTo = document.querySelector('.header-routes__planned-date--report__to')
  const planDivider = document.querySelector('.plan-divider')

  planDivider.addEventListener('click', () => {
    planDivider.classList.toggle('route__filter--chosen')
  })

  let today = getTime()
  today = today.substring(0, today.length - 5).trim()

  filterDateFrom.value = today.trim()
  filterDateTo.value = today.trim()
  let check = new Date(filterDateTo.value)
  check.setDate(check.getDate() + 30)
  filterDateTo.value = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`
  filterDateTo.setAttribute('min', String(today.trim()))
  filterDateFrom.setAttribute('min', String(today.trim()))
  const dynamicDate = document.querySelector('.table__route--date')

  let maxRes = -1
  const recreatePlansTable = () => {
    deleteOrders()

    state.orders.forEach(plan => {
      drawPlan(plan)
    })

    let maxLength = -1
    setTimeout(() => {
      document.querySelectorAll('.table__route--date__list').forEach(datesList => {
        maxLength = Math.max(datesList.querySelectorAll('.plan-dates__item').length, maxLength)
      })

      dynamicDate.style.minWidth = `${(maxLength * 37) - 3}px`
      console.log(maxLength)
    }, 200)
  }

  filterDateFrom.addEventListener('change', () => {
    filterDateTo.setAttribute('min', String(filterDateFrom.value))

    if (new Date(filterDateFrom.value).getTime() >= new Date(filterDateTo.value).getTime()) {
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
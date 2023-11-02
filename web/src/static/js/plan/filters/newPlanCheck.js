import {getTime} from "../../modules/getTime";
import {state} from "../../modules/state";
import {drawPlan, globalDatesObj} from "../drawPlan";
import {deleteOrders} from "../../modules/getOrders";

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

  const recreatePlansTable = () => {
    deleteOrders()

    state.orders.forEach(plan => {
      drawPlan(plan)
    })

    const datesList = document.querySelectorAll('.table__route--date__list')
    setTimeout(() => {
      datesList.forEach(dateList => {
        const dates = dateList.querySelectorAll('.plan-dates__item')
        let maxDivider = {}

        for (let i = 0; i < dates.length; i++) {
          const dateItem = dates[i]
          const trimmedDate = dateItem.textContent.trim()

          if (!maxDivider[trimmedDate]) {
            maxDivider[trimmedDate] = 1
          } else {
            maxDivider[trimmedDate]++
          }

          while (maxDivider[trimmedDate] < globalDatesObj[trimmedDate]) {
            const nextDate = dates[i + maxDivider[trimmedDate]]
            const nextTrimmedDate = nextDate.textContent.trim()

            if (trimmedDate !== nextTrimmedDate) {
              dates[i].insertAdjacentHTML('afterend', `
                <li class="plan-dates__item plan-dates__item--busy plan-dates__item--small route__btn">
  
                </li>
              `)
            }

            maxDivider[trimmedDate]++
          }
        }
      })


      const sum  = Object.values(globalDatesObj).reduce((a, b) => a + b, 0)
      dynamicDate.style.minWidth = `${(sum * 37) - 3}px`

    }, 60 * datesList.length)
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
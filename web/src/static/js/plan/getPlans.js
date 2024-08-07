import {state} from "../modules/state";
import {sendData} from "../modules/sendData";
import {appAddr} from "../../../../../appAddr";
import {deleteOrders, hideOrders} from "../modules/getOrders";
import {newAllPlanFilter} from "./filters/newAllPlanFilter";

export const getPlans = (updateOnly) => {
  deleteOrders()
  const from = document.querySelector(".header-routes__planned-date--report__from").value
  const to = document.querySelector(".header-routes__planned-date--report__to").value
  const loader = document.querySelector('.spinner-loader')
  const dynamicDate = document.querySelector('.table__route--date')
  loader.classList.remove('hidden__input')

  const links = document.querySelectorAll('.nav-control__route-link')
  const planLink = document.querySelector('.link__plan')
  document.title = 'Планирование'
  links.forEach(link => {
    link.classList.remove('nav-control__route-link--current')
  })

  planLink.classList.add('nav-control__route-link--current')
  console.time('get orders')

  // console.log('start time', state.maxTime)
  const params = {
    'from': from,
    'to': to,
    'is_client': state.clientCheck,
    'client_name': state.clientName,
  }

  sendData(`${appAddr}/api/planning/get-all`, 'POST', JSON.stringify(params))
    .then(res => res.json())
    .then(data => {
      console.timeEnd('get orders')
      const title = document.querySelector('.main-header__title')

      console.time('draw orders')

      if (!data.data) {
        if (!updateOnly) {
          hideOrders()
          state.orders = data.data
          title.textContent = 'Планирование (0)'
          return
        }

        console.log('PROBLEM HERE?')
        // document.querySelector('.nav-control__total').textContent = `Всего в ${state.isArchive ? 'архиве' : 'работе'} 0`
      }

      // deleteTableFilters()
      // deleteOrders()

      const isEmptyData = checkThis => {
        return checkThis || 'Не заполнено'
      }

      if (data.data) {
        state.orders = data.data

        title.textContent = `Планирование (${state.orders.length})`
        // data.data.forEach(d => {
        //   drawPlan(d, data, from, to)
        // })

        newAllPlanFilter(true)
        loader.classList.add('hidden__input')
        // console.log()

        // if (updateOnly) {
        //   const routesStatusFilter = document.querySelector('.route__filter--chosen')
        //   let filtered = state.filtered || !!state.currentTopFilters.length || routesStatusFilter
        //   console.log('updatedData', data.data)
        //   data.data.forEach(d => {
        //     drawUpdatedData(d, state.orders, filtered)
        //   })
        //
        //   if (filtered) {
        //     newAllFilter()
        //   } else {
        //     bindOrdersListeners()
        //   }
        //
        //   console.log('??')
        //
        //   title.textContent = state.isArchive ? `Архив заказов (${state.orders.length})` : `Журнал заказов (${state.orders.length})`
        // } else {
        //   title.textContent = state.isArchive ? `Архив заказов (${state.orders.length})` : `Журнал заказов (${state.orders.length})`
        //   state['orders'] = data.data
        //   state['filteredOrders'] = state['orders'].filter(o => o)
        //   newAllFilter(true)
        // }
      } else {

      }

      // const datesList = document.querySelectorAll('.table__route--date__list')
      // setTimeout(() => {
      //   datesList.forEach(dateList => {
      //     const dates = dateList.querySelectorAll('.plan-dates__item')
      //     let maxDivider = {}
      //
      //     for (let i = 0; i < dates.length; i++) {
      //       const dateItem = dates[i]
      //       const trimmedDate = dateItem.textContent.trim()
      //
      //       if (!maxDivider[trimmedDate]) {
      //         maxDivider[trimmedDate] = 1
      //       } else {
      //         maxDivider[trimmedDate]++
      //       }
      //
      //       while (maxDivider[trimmedDate] < globalDatesObj[trimmedDate]) {
      //         const nextDate = dates[i + maxDivider[trimmedDate]]
      //         const nextTrimmedDate = nextDate.textContent.trim()
      //
      //         console.log(trimmedDate, nextTrimmedDate)
      //
      //         if (trimmedDate !== nextTrimmedDate) {
      //           dates[i].insertAdjacentHTML('afterend', `
      //             <li class="plan-dates__item plan-dates__item--busy plan-dates__item--small route__btn">
      //
      //             </li>
      //           `)
      //         }
      //
      //         maxDivider[trimmedDate]++
      //       }
      //     }
      //   })
      //
      //   const sum = Object.values(globalDatesObj).reduce((a, b) => a + b, 0)
      //   dynamicDate.style.minWidth = `${(sum * 37) - 3}px`
      //   console.log(sum)
      //
      // }, 60 * datesList.length)

      const datesList = document.querySelectorAll('.table__route--date__list')
      setTimeout(() => {
        let max = 0

        datesList.forEach(dateList => {
          const dates = dateList.querySelectorAll('.plan-dates__item')
          max = Math.max(dates.length)
        })

        // const sum  = Object.values(globalDatesObj).reduce((a, b) => a + b, 0)
        dynamicDate.style.minWidth = `${(max * 37) - 3}px`

      }, 60 * datesList.length)

      console.timeEnd('draw orders')

      // drawTableFilter([...new Set(state['nums'])].sort(), numsFilter)
      // drawTableFilter([...new Set(state['clients'])].sort(), clientsFilter)
      // drawTableFilter([...new Set(state['materials'])].sort(), materialsFilter)
      // drawTableFilter([...new Set(state['names'])].sort(), namesFilter)
      // drawTableFilter([...new Set(state['quantity'])].sort(), quantityFilter)
      // drawTableFilter([...new Set(state['issued'])].sort(), issuedFilter)
      // drawTableFilter([...new Set(state['managers'])].sort(), managerFilter)
      // drawTableFilter([...new Set(state['deadlines'])].sort(), deadlineFilter)
      // drawTableFilter([...new Set(state['timestamps'])].sort(), timestampFilter)
      // bindTableFilters()

      // title.textContent = state.isArchive ? `Архив заказов (${state.orders.length})` : `Журнал заказов (${state.orders.length})`
      // if (state['isArchive']) {
      //   document.querySelectorAll('.table__data').forEach(field => {
      //     field.setAttribute("readonly", "true")
      //   })
      // }

      // const lastOrder = document.querySelector('.table__data--chosen')
      // if (lastOrder) {
      //   lastOrder.scrollIntoView({block: 'center'})
      // }

      // document.querySelectorAll(".table-form").forEach(form => {
      //   form.addEventListener('click', e => {
      //     console.log("I am form hi)")
      //   })
      // })
    })
}
import {state} from "../modules/state";
import {sendData} from "../modules/sendData";
import {appAddr} from "../../../../../appAddr";
import {deleteOrders, hideOrders} from "../modules/getOrders";
import {drawPlan, getDays} from "./drawPlan";

export const getPlans = (updateOnly) => {
  deleteOrders()
  const from = document.querySelector(".header-routes__planned-date--report__from").value
  const to = document.querySelector(".header-routes__planned-date--report__to").value

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
    'order_old': false,
    'planning': true,
    'plan_from': from,
    'plan_to': to,
    'update_only': updateOnly,
  }

  sendData(`${appAddr}/api/planning/get-all`, 'GET')
    .then(res => res.json())
    .then(data => {
      console.timeEnd('get orders')
      const title = document.querySelector('.main-header__title')

      console.time('draw orders')

      if (!data.data) {
        if (!updateOnly) {
          hideOrders()
          state.orders = data.data
          title.textContent = state.isArchive ? 'Архив пуст' : 'Журнал пуст'
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

        data.data.forEach(d => {
          drawPlan(d, data, from, to)
        })

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
      }

      console.timeEnd('draw orders')

      console.time('add filters and listeners')
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

      console.timeEnd('add filters and listeners')

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
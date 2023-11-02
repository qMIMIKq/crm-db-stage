import {state} from "../../modules/state";
import {deleteOrders, hideOrders} from "../../modules/getOrders";
import {controlPlanFiltersReset} from "./controlPlanFilterReset";
import {drawPlan} from "../drawPlan";
import {planShowCurrentLine} from "../planShowCurrentLine";

export const newAllPlanFilter = async (init) => {
  hideOrders()

  let flag = true

  const searched = state.searched

  const topRouteFilters = state.currentTopFilters.map(filter => filter.name)
  const tableFilters = state.tableFilters

  const isTopRoutesFiltered = !!topRouteFilters.length
  controlPlanFiltersReset()

  if (searched) {
    console.log('??')

    state.orders.forEach(order => {
      for (let type in state['tableFilters']) {
        const filter = tableFilters[type]
        const orderData = order[type]

        if (filter === 'все') {
        } else if (filter === 'Не заполнено') {
          if (orderData) {
            flag = false
            break
          }
        } else if (filter) {
          if (type === 'end_time') {
            if (!(orderData && orderData.split('T')[0] === filter)) {
              console.log('??')
              flag = false
              break
            }
          } else if (type === 'timestamp') {
            const deadline = orderData.split('T')[0]
            if (!(deadline === state['tableFilters'][type])) {
              flag = false
              break
            }

          } else if (!(orderData.trim().toLowerCase().includes(filter.trim().toLowerCase()))) {
            flag = false
            break
          }
        }
      }

      if (flag) {
        if (isTopRoutesFiltered) {
          console.log(order.route_plot)
          if (topRouteFilters.includes(order.route_plot)) {

          } else {
            flag = false
          }
        }
      } else {
        flag = false
      }

      if (flag) {
        const hiddenOrder = document.querySelector(`#form-${order.id}`)
        if (hiddenOrder !== null) {
          hiddenOrder.classList.remove('hidden__input')
        } else {
          drawPlan(order)
        }
      }

      flag = true
    })
  }

  if (!searched) {
    if (isTopRoutesFiltered) {
      state.orders.forEach(order => {
        console.log(order.route_plot)
        if (topRouteFilters.includes(order.route_plot)) {

        } else {
          flag = false
        }

        if (flag) {
          const hiddenOrder = document.querySelector(`#form-${order.id}`)
          if (hiddenOrder !== null) {
            hiddenOrder.classList.remove('hidden__input')
          }else {
            drawPlan(order)
          }
        }

        flag = true
      })
    }
  }

  if (!searched && !isTopRoutesFiltered) {
    if (init) {
      deleteOrders()

      state.orders.forEach(order => {
        drawPlan(order, state.orders)
        // console.log(order.id)
        // document.querySelector(`#form-${order.id}`).classList.remove('hidden__input')
        // order.classList.remove('hidden__input')
      })
    } else {
      state.orders.forEach(order => {
        // drawOrders(table, `afterbegin`, order, state.orders, state.managers)
        // console.log(order.id)
        const hiddenOrder = document.querySelector(`#form-${order.id}`)
        if (hiddenOrder !== null) {
          hiddenOrder.classList.remove('hidden__input')
        }else {
          drawPlan(order)
        }
        // order.classList.remove('hidden__input')
      })
    }
  }

  planShowCurrentLine()
}
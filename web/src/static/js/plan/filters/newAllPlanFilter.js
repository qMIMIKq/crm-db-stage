import {state} from "../../modules/state";
import {deleteOrders, hideOrders} from "../../modules/getOrders";
import {controlPlanFiltersReset} from "./controlPlanFilterReset";
import {drawPlan} from "../drawPlan";
import {planShowCurrentLine} from "../planShowCurrentLine";
import {drawReport} from "../../report/drawReport";
import {table} from "../../modules/drawe/drawOrders";

export const newAllPlanFilter = async (init) => {
  hideOrders()
  const startTime = document.querySelector('.header-routes__planned-date--report__from').value

  let flag = true

  const searched = state.searched
  const hideNotIncluded = state.hideNotIncluded

  const topRouteFilters = state.currentTopFilters.map(filter => filter.name)
  const tableFilters = state.tableFilters

  const isTopRoutesFiltered = !!topRouteFilters.length
  controlPlanFiltersReset()

  if (hideNotIncluded && !searched && !isTopRoutesFiltered) {
    state.orders.forEach(order => {
      if (!order.db_plan) {
        flag = false
      } else {
        const endDate = new Date(startTime)
        const eldestDate = new Date(order.db_plan[order.db_plan.length - 1].date.split('T')[0])
        if (endDate.getTime() > eldestDate.getTime()) {
          flag = false
        }
      }

      if (flag) {
        const hiddenOrder = document.querySelector(`#form-${order.id}`)
        if (hiddenOrder !== null) {
          hiddenOrder.classList.remove('hidden__input')
          hiddenOrder.classList.add('showed-order')
        } else {
          drawPlan(order)
        }
      }

      flag = true
    })
  }

  if (searched) {
    state.orders.forEach(order => {
      if (tableFilters['every']) {
        flag = false

        for (let type in tableFilters) {
          if (type === 'every') {
            continue
          }

          let filter = tableFilters['every']
          const orderData = order[type]

          console.log(order.id, type, orderData, filter)
          if ((orderData.trim().toLowerCase().includes(filter.trim().toLowerCase()))) {
            console.log('find this')
            flag = true
            break
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

          if (hideNotIncluded) {
            if (!order.db_plan) {
              flag = false
            } else {
              const endDate = new Date(startTime)
              const eldestDate = new Date(order.db_plan[order.db_plan.length - 1].date.split('T')[0])
              if (endDate.getTime() > eldestDate.getTime()) {
                flag = false
              }
            }
          }
        } else {
          flag = false
        }

        if (flag) {
          const hiddenOrder = document.querySelector(`#form-${order.id}`)
          if (hiddenOrder !== null) {
            hiddenOrder.classList.remove('hidden__input')
            hiddenOrder.classList.add('showed-order')
          } else {
            drawPlan(order)
          }
        }

        flag = false
      } else {
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

          if (hideNotIncluded) {
            if (!order.db_plan) {
              flag = false
            } else {
              const endDate = new Date(startTime)
              const eldestDate = new Date(order.db_plan[order.db_plan.length - 1].date.split('T')[0])
              if (endDate.getTime() > eldestDate.getTime()) {
                flag = false
              }
            }
          }
        } else {
          flag = false
        }

        if (flag) {
          const hiddenOrder = document.querySelector(`#form-${order.id}`)
          if (hiddenOrder !== null) {
            hiddenOrder.classList.remove('hidden__input')
            hiddenOrder.classList.add('showed-order')
          } else {
            drawPlan(order)
          }
        }

        flag = true
      }
    })
  }

  if (!searched) {
    if (isTopRoutesFiltered) {
      state.orders.forEach(order => {
        if (topRouteFilters.includes(order.route_plot)) {

        } else {
          flag = false
        }

        if (hideNotIncluded) {
          if (!order.db_plan) {
            flag = false
          } else {
            const endDate = new Date(startTime)
            const eldestDate = new Date(order.db_plan[order.db_plan.length - 1].date.split('T')[0])
            if (endDate.getTime() > eldestDate.getTime()) {
              flag = false
            }
          }
        }

        if (flag) {
          const hiddenOrder = document.querySelector(`#form-${order.id}`)
          if (hiddenOrder !== null) {
            hiddenOrder.classList.remove('hidden__input')
            hiddenOrder.classList.add('showed-order')
          } else {
            drawPlan(order)
          }
        }

        flag = true
      })
    }
  }

  if (!searched && !isTopRoutesFiltered && !hideNotIncluded) {
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
          hiddenOrder.classList.add('showed-order')
        } else {
          drawPlan(order)
        }
        // order.classList.remove('hidden__input')
      })
    }
  }

  const dataLength = table.querySelectorAll('.showed-order').length
  document.querySelector('.main-header__title').textContent = `Планирование (${dataLength})`

  planShowCurrentLine()
}
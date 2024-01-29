import {state} from "../../modules/state";
import {deleteOrders, hideOrders} from "../../modules/getOrders";
import {drawReport} from "../drawReport";
import {controlReportsFiltersReset} from "./reportFilters";
import {filterRoutesState} from "../../modules/filters/filterRoutesState";
import {colorRoutes} from "../../modules/drawe/routesDraw";
import {drawOrders, table} from "../../modules/drawe/drawOrders";
import {bindOrdersListeners} from "../../modules/bindListeners";
import {bindReportsListeners} from "../bindReportListener";
import {planShowCurrentLine} from "../../plan/planShowCurrentLine";
import {reportShowCurrentLine} from "../reportShowCurrentLine";

export const newAllReportFilter = (init) => {
  hideOrders()

  let flag = true

  const filtered = state.filtered
  const searched = state.searched

  const topRouteFilters = state.currentTopFilters.map(filter => filter.name)
  const tableFilters = state.tableFilters

  const isTopRoutesFiltered = !!topRouteFilters.length
  controlReportsFiltersReset()

  if (searched) {
    state.orders.forEach((order, i) => {
      if (tableFilters['every']) {
        flag = false

        for (let type in tableFilters) {
          if (type === 'every') {
            continue
          }

          let filter = tableFilters['every']
          const orderData = String(order[type])

          if ((orderData.trim().toLowerCase().includes(filter.trim().toLowerCase()))) {
            console.log('find this')
            flag = true
            break
          }
        }

        if (flag) {
          if (isTopRoutesFiltered) {
            if (topRouteFilters.includes(order.order_plot)) {

            } else {
              flag = false
            }
          }
        } else {
          flag = false
        }

        if (flag) {
          const hiddenOrder = document.querySelector(`#form-${order.report_id}`)
          if (hiddenOrder !== null) {
            hiddenOrder.classList.remove('hidden__input')
            hiddenOrder.classList.add('showed-order')

          } else {
            drawReport(order)
          }
        }

        flag = false
      } else {
        for (let type in state['tableFilters']) {
          const filter = String(tableFilters[type])
          const orderData = String(order[type])

          if (filter === 'все') {
          } else if (filter === 'Не заполнено') {
            if (orderData) {
              flag = false
              break
            }
          } else if (filter) {
            if (type === 'end_time') {
              if (!(orderData && orderData.split('T')[0] === filter)) {
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
            if (topRouteFilters.includes(order.order_plot)) {

            } else {
              flag = false
            }
          }
        } else {
          flag = false
        }

        if (flag) {
          const hiddenOrder = document.querySelector(`#form-${order.report_id}`)
          if (hiddenOrder !== null) {
            hiddenOrder.classList.remove('hidden__input')
            hiddenOrder.classList.add('showed-order')
          } else {
            drawReport(order, i)
          }
        }

        flag = true
      }
    })
  } else if (filtered) {
    state.orders.forEach(order => {
      for (let type in tableFilters) {
        const filter = String(tableFilters[type])
        const orderData = String(order[type])

        if (filter === 'все') {
        } else if (filter === 'Не заполнено') {
          if (orderData) {
            flag = false
            break
          }
        } else if (filter) {
          if (type === 'end_time') {
            if (!(orderData && orderData.split('T')[0] === filter)) {
              flag = false
              break
            }
          } else if (type === 'timestamp') {
            if (!(orderData.split('T')[0] === filter)) {
              flag = false
              break
            }
          } else if (!(orderData.trim() === filter.trim())) {
            flag = false
            break
          }
        }
      }

      if (flag) {
        if (isTopRoutesFiltered) {
          if (topRouteFilters.includes(order.order_plot)) {

          } else {
            flag = false
          }
        }
      } else {
        flag = false
      }

      if (flag) {
        const hiddenOrder = document.querySelector(`#form-${order.report_id}`)
        if (hiddenOrder !== null) {
          hiddenOrder.classList.remove('hidden__input')
          hiddenOrder.classList.add('showed-order')
        } else {
          drawReport(order)
        }
      }

      flag = true
    })
  }

  if (!searched) {
    if (isTopRoutesFiltered) {
      state.orders.forEach((order, i) => {
        if (topRouteFilters.includes(order.order_plot)) {

        } else {
          flag = false
        }

        if (flag) {
          const hiddenOrder = document.querySelector(`#form-${order.report_id}`)
          if (hiddenOrder !== null) {
            hiddenOrder.classList.remove('hidden__input')
            hiddenOrder.classList.add('showed-order')
          } else {
            drawReport(order)
          }
        }

        flag = true
      })
    }
  }

  if (!searched && !isTopRoutesFiltered && !filtered) {
    if (init) {
      deleteOrders()

      state.orders.forEach((order, i) => {
        drawReport(order)
      })
    } else {
      state.orders.forEach((order, i) => {
        const hiddenOrder = document.querySelector(`#form-${order.report_id}`)
        if (hiddenOrder !== null) {
          hiddenOrder.classList.remove('hidden__input')
          hiddenOrder.classList.add('showed-order')
        } else {
          drawReport(order)
        }
      })
    }
  }

  const dataLength = table.querySelectorAll('.showed-order').length
  document.querySelector('.main-header__title').textContent = `План/факт (${dataLength})`
  reportShowCurrentLine()
}
import {state} from "../state";
import {hideOrders} from "../getOrders";
import {filterRoutesState, filterRouteStateGlobal} from "./filterRoutesState";
import {drawOrders, table} from "../drawe/drawOrders";
import {bindOrdersListeners} from "../bindOrdersListeners";
import {controlFiltersReset} from "./tableFilters";
import {colorRoutes} from "../drawe/routesDraw";

const searchedFilter = (order, tableFilters) => {
  let flag = false
  for (let type in tableFilters) {
    if (type === 'every') continue

    const orderData = order[type]
    let filter = tableFilters[type]
    if (tableFilters.every) {
      filter = tableFilters.every
    }

    if ((orderData.trim().toLowerCase().includes(filter.trim().toLowerCase()))) {
      // console.log('find this')
      flag = true
      break
    }
  }

  return flag
}

const tableClickFilter = (order, tableFilters) => {
  let flag = true

  for (let type in tableFilters) {
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

  return flag
}

export const newAllFilter = (init) => {
  hideOrders()

  let flag = true

  const searched = state.searched
  const filtered = state.filtered

  const topRouteFilters = state.currentTopFilters.map(filter => filter.name)
  const tableRouteStatusFilters = state.routesFilters
  const tableFilters = state.tableFilters

  const isRouteStatusFiltered = !!Object.keys(tableRouteStatusFilters).length
  const isTopRoutesFiltered = !!topRouteFilters.length

  const filtersBtn = document.querySelector('.header-filters')

  // if (isRouteStatusFiltered) {
  //   console.log(tableRouteStatusFilters)
  //   filtersBtn.style.cssText = `border: 2px solid green`
  // } else {
  //   filtersBtn.style.cssText = `border: none`
  // }

  console.log(tableRouteStatusFilters)

  let needGlobalRoutsFilter = Object.keys(tableRouteStatusFilters).length > 1
  console.log(needGlobalRoutsFilter)


  let needRoutesFilters = false
  if ((isTopRoutesFiltered || isRouteStatusFiltered || state.routesAlertFilter || state.routesPlannedFilter)) {
    needRoutesFilters = true
  }
  controlFiltersReset()


  for (let i = 0; i < state.orders.length; i++) {
    const order = state.orders[i]
    if (init) {
      // deleteOrders()
      drawOrders(table, `afterbegin`, order, state.orders, state.managers)
    }

    let globalFilterFlag = false

    if (searched) {
      globalFilterFlag = searchedFilter(order, tableFilters)
      if (!globalFilterFlag) {
        continue
      }
    } else if (filtered) {
      globalFilterFlag = tableClickFilter(order, tableFilters)
      if (!globalFilterFlag) {
        continue
      }
    } else {
      globalFilterFlag = true
    }

    let globalRouteFlag = false
    if (globalFilterFlag) {
      if (!needRoutesFilters) {
        globalRouteFlag = true
      } else {
        if (!order.db_routes) {
          globalRouteFlag = false
        } else {
          for (let j = 0; j < order.db_routes.length; j++) {
            let routeFlag = false

            let route = order.db_routes[j]
            let statusFlag = false
            let alertFlag = false
            let planFlag = false
            let routeFilterFlag = flag

            if (isTopRoutesFiltered) {
              routeFilterFlag = topRouteFilters.includes(route.plot)
            } else {
              routeFilterFlag = true
            }

            if (isRouteStatusFiltered) {
              if (needGlobalRoutsFilter) {
                statusFlag = filterRouteStateGlobal(route)
              }

              statusFlag = filterRoutesState(route)
              // console.log(statusFlag)
            } else {
              statusFlag = true
            }

            if (state.routesAlertFilter) {
              if (route.alert_color && route.alert_color === document.querySelector('.header-routes__alert').value) {
                alertFlag = true
              }
            } else {
              alertFlag = true
            }

            if (state.routesPlannedFilter) {
              const date = document.querySelector('.header-routes__planned-date')
              if (route.plan_dates.includes(date.value)) {
                planFlag = true
              }
            } else {
              planFlag = true
            }

            // if (statusFlag || alertFlag || routeFilterFlag) {
            //   console.log(`order id ${order.id} route ${route.route_position} plot ${route.plot} -- status ${statusFlag} / alert ${alertFlag} / plan ${planFlag}}`)
            // }

            routeFlag = statusFlag && alertFlag && planFlag && routeFilterFlag
            if (routeFlag) {
              globalRouteFlag = true
              break
            }
          }
        }
      }
    }

    // console.log(`order ${globalRouteFlag}`)

    if (globalFilterFlag && globalRouteFlag) {
      const hiddenOrder = document.querySelector(`#form-${order.id}`)
      if (hiddenOrder !== null) {
        hiddenOrder.classList.remove('hidden__input')
        hiddenOrder.classList.add('showed-order')
        if (order.db_routes && order.db_routes.length) {
          colorRoutes(order.db_routes, hiddenOrder)
        }

      } else {
        drawOrders(table, `afterbegin`, order, state.orders, state.managers)
      }
    }
  }

  const dataLength = table.querySelectorAll('.showed-order').length
  document.querySelector('.main-header__title').textContent = state.isArchive ? `Архив заказов (${dataLength})` : `Журнал заказов (${dataLength})`
  bindOrdersListeners()
  // reportShowCurrentLine()
}
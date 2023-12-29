import {state} from "../state";
import {deleteOrders, hideOrders} from "../getOrders";
import {filterRoutesState} from "./filterRoutesState";
import {drawOrders, table} from "../drawe/drawOrders";
import {bindOrdersListeners} from "../bindListeners";
import {controlFiltersReset} from "./tableFilters";
import {colorRoutes} from "../drawe/routesDraw";

export const newAllFilter = (init) => {
  hideOrders()

  let flag = true

  const searched = state.searched
  const filtered = state.filtered

  const topRouteFilters = state.currentTopFilters.map(filter => filter.name)
  const tableRouteStatusFilters = state.routesFilters
  const tableFilters = state.tableFilters

  const isRouteStatusFiltered = tableRouteStatusFilters.completed || tableRouteStatusFilters.error || tableRouteStatusFilters.planned || tableRouteStatusFilters.started || tableRouteStatusFilters.unstarted
  const isTopRoutesFiltered = !!topRouteFilters.length

  controlFiltersReset()

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
          if (isRouteStatusFiltered || isTopRoutesFiltered) {
            if (order.db_routes) {
              const routes = order.db_routes

              for (let i = 0; i < routes.length; i++) {
                let statusFlag = true
                let plotFlag = true

                const route = routes[i]
                if (isRouteStatusFiltered) {
                  statusFlag = filterRoutesState(route)
                  console.log('status routes filter', statusFlag)
                }

                if (isTopRoutesFiltered) {
                  plotFlag = topRouteFilters.includes(route.plot)
                  console.log('top routes filter', plotFlag)
                }

                flag = statusFlag && plotFlag
                if (flag) break
              }

            } else {
              console.log('no routes')
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
            if (order.db_routes && order.db_routes.length) {
              colorRoutes(order.db_routes, hiddenOrder)
            }
          } else {
            drawOrders(table, `afterbegin`, order, state.orders, state.managers)
          }
        }

        flag = false
      } else {
        for (let type in tableFilters) {
          let filter = tableFilters[type]
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
      }

      console.log(flag)
    })

  } else if (filtered) {
    console.log('filtered', filtered)

    state.orders.forEach(order => {
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

      if (flag) {
        if (isRouteStatusFiltered || isTopRoutesFiltered) {
          if (order.db_routes) {
            const routes = order.db_routes

            for (let i = 0; i < routes.length; i++) {
              let statusFlag = true
              let plotFlag = true

              const route = routes[i]
              if (isRouteStatusFiltered) {
                statusFlag = filterRoutesState(route)
              }

              if (isTopRoutesFiltered) {
                plotFlag = topRouteFilters.includes(route.plot)
              }

              flag = statusFlag && plotFlag
              if (flag) break
            }

          } else {
            flag = false
          }
        }
      } else {
        flag = false
      }

      if (flag) {
        // drawOrders(table, `afterbegin`, order, state.orders, state.managers)
        const hiddenOrder = document.querySelector(`#form-${order.id}`)
        if (hiddenOrder !== null) {
          hiddenOrder.classList.remove('hidden__input')
          if (order.db_routes && order.db_routes.length) {
            colorRoutes(order.db_routes, hiddenOrder)
          }

        } else {
          drawOrders(table, `afterbegin`, order, state.orders, state.managers)
        }
      }

      flag = true
    })
  }

  if (!searched && !filtered) {
    if (isRouteStatusFiltered || isTopRoutesFiltered) {
      state.orders.forEach(order => {
        if (!order.db_routes) {
          flag = false
        } else {
          const routes = order.db_routes

          for (let i = 0; i < routes.length; i++) {
            let statusFlag = true
            let plotFlag = true

            const route = routes[i]
            if (isRouteStatusFiltered) {
              statusFlag = filterRoutesState(route)
            }

            if (isTopRoutesFiltered) {
              plotFlag = topRouteFilters.includes(route.plot)
            }

            flag = statusFlag && plotFlag
            if (flag) {
              // drawOrders(table, `afterbegin`, order, state.orders, state.managers)
              const hiddenOrder = document.querySelector(`#form-${order.id}`)
              if (hiddenOrder !== null) {
                hiddenOrder.classList.remove('hidden__input')
                if (order.db_routes && order.db_routes.length) {
                  colorRoutes(order.db_routes, hiddenOrder)
                }
              } else {
                drawOrders(table, `afterbegin`, order, state.orders, state.managers)
              }
              break
            }
          }
        }
      })
    }
  }

  if (!searched && !filtered && !isTopRoutesFiltered && !isRouteStatusFiltered) {
    if (init) {
      deleteOrders()

      state.orders.forEach(order => {
        drawOrders(table, `afterbegin`, order, state.orders, state.managers)
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
          if (order.db_routes && order.db_routes.length) {
            colorRoutes(order.db_routes, hiddenOrder)
          }
        } else {
          drawOrders(table, `afterbegin`, order, state.orders, state.managers)
        }
        // order.classList.remove('hidden__input')
      })
    }
  }

  bindOrdersListeners()
}
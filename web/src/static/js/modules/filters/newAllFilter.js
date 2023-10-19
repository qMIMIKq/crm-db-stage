import {state} from "../state";
import {deleteOrders} from "../getOrders";
import {filterRoutesState} from "./filterRoutesState";
import {drawOrders, table} from "../drawe/drawOrders";
import {bindOrdersListeners} from "../bindListeners";

export const newAllFilter = () => {
  deleteOrders()

  let flag = true

  const searched = state.searched
  const filtered = state.filtered

  const topRouteFilters = state.currentTopFilters.map(filter => filter.name)
  const tableRouteStatusFilters = state.routesFilters
  const tableFilters = state.tableFilters

  const isRouteStatusFiltered = tableRouteStatusFilters.completed || tableRouteStatusFilters.error || tableRouteStatusFilters.planned || tableRouteStatusFilters.started || tableRouteStatusFilters.unstarted
  const isTopRoutesFiltered = !!topRouteFilters.length

  if (searched) {
    console.log('searched', searched)
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
        if (isRouteStatusFiltered || isTopRoutesFiltered) {
          console.log('routes filters')
          if (order.db_routes) {
            console.log('we have routes')
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

      console.log(flag)
      if (flag) {
        console.log('DRAW FILTERED DATA')
        drawOrders(table, `afterbegin`, order, state.orders, state.managers)
      }

      flag = true

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
          console.log('routes filters')
          if (order.db_routes) {
            console.log('we have routes')
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

      console.log(flag)
      if (flag) {
        console.log('DRAW FILTERED DATA')
        drawOrders(table, `afterbegin`, order, state.orders, state.managers)
      }

      flag = true
    })
  }

  if (!searched && !filtered) {
    if (isRouteStatusFiltered || isTopRoutesFiltered) {
      console.log('hello', isRouteStatusFiltered, isTopRoutesFiltered)

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
              drawOrders(table, `afterbegin`, order, state.orders, state.managers)
              break
            }
          }
        }
      })
    }
  }

  if (!searched && !filtered && !isTopRoutesFiltered && !isRouteStatusFiltered) {
    console.log('just draw data')

    state.orders.forEach(order => {
      drawOrders(table, `afterbegin`, order, state.orders, state.managers)
    })
  }

  bindOrdersListeners()
}
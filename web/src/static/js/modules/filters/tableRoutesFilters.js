import {state} from "../state";
import {globalFilterOrders} from "./filterOrders";
import {filterData} from "./topFilters";
import {drawOrders} from "../drawOrders";
import {deleteOrders, getOrders} from "../orders";
import {bindOrdersListeners} from "../bindListeners";
import {getTime} from "../getTime";

export const startFilter = (filters) => {
  state['orders'].forEach(order => {
    let check = false

    if (order.db_routes) {
      order.db_routes.forEach(route => {
        if (route.start_time && !route.end_time) {
          if (filters.length) {
            if (filters.includes(route.plot)) {
              check = true
            }
          } else {
            check = true
          }
        }
      })
    }


    return checkDoFilter(check, order)
  })

  bindOrdersListeners()
}

export const errFilter = (filters) => {
  state['orders'].forEach(order => {
    let check = false

    if (order.db_routes) {
      order.db_routes.forEach(route => {
        if (route.error_msg) {
          if (filters.length) {
            if (filters.includes(route.plot)) {
              check = true
            }
          } else {
            check = true
          }

        }
      })
    }

    return checkDoFilter(check, order)
  })

  bindOrdersListeners()
}

export const completedFilter = (filters) => {
  state['orders'].forEach(order => {
    let check = false

    if (order.db_routes) {
      order.db_routes.forEach(route => {
        if (route.end_time) {
          if (filters.length) {
            if (filters.includes(route.plot)) {
              check = true
            }
          } else {
            check = true
          }
        }
      })
    }
    return checkDoFilter(check, order)
  })

  bindOrdersListeners()
}

export const notInWorkFilter = filters => {
  state['orders'].forEach(order => {
    let check = false

    if (order.db_routes) {
      order.db_routes.forEach(route => {
        if (!route.start_time) {
          if (filters.length) {
            if (filters.includes(route.plot)) {
              check = true
            }
          } else {
            check = true
          }
        }
      })
    }
    return checkDoFilter(check, order)
  })

  bindOrdersListeners()
}

const checkDoFilter = (check, order) => {
  if (check) {
    if (state['filtered'] && filters.length) {
      globalFilterOrders(order)
      filterData()
    } else if (state['filtered']) {
      console.log('table filters')
      globalFilterOrders(order)
    } else {
      drawOrders(order, state['filteredOrders'], state['managers'])
    }
  }

  return check
}

export const plannedFilter = (filters, date) => {
  let dateToday = new Date(date).getTime()

  state['orders'].forEach(order => {
    let check = false

    if (order.db_routes) {
      order.db_routes.forEach(route => {
        if (route.plan_date) {
          let planDate = new Date(route.plan_date).getTime()
          let planStart = new Date(route.plan_start).getTime()

          if (planStart <= dateToday && dateToday <= planDate && !route.exclude_days.includes(date)) {
            if (filters.length) {
              if (filters.includes(route.plot)) {
                check = true
              }
            } else {
              check = true
            }
          }
        }
      })
    }
    return checkDoFilter(check, order)
  })

  bindOrdersListeners()
}

export const tableRoutesFiltersHandler = () => {
  const inWorkBtn = document.querySelector(".header-routes__work")
  const notWorkBtn = document.querySelector(".header-routes__unwork")
  const inErrorBtn = document.querySelector(".header-routes__error")
  const completedBtn = document.querySelector(".header-routes__completed")
  const inPlanBtn = document.querySelector(".header-routes__planned")
  const inPlanDate = document.querySelector('.header-routes__planned-date')

  inWorkBtn.addEventListener('click', e => {
    if (inWorkBtn.classList.contains('route__filter--chosen')) {
      inWorkBtn.classList.remove('route__filter--chosen')
      state['routesFilters'].started = false
      getOrders()
      return
    }

    try {
      document.querySelector('.route__filter--chosen').classList.remove('route__filter--chosen')
    } catch {
    }
    inWorkBtn.classList.add('route__filter--chosen')

    state['routesFilters'].started = true
    state['routesFilters'].unstarted = false
    state['routesFilters'].error = false
    state['routesFilters'].completed = false
    state['routesFilters'].planned = false

    deleteOrders()
    const filters = state['currentTopFilters'].map(filter => filter.name)
    startFilter(filters)
  })

  notWorkBtn.addEventListener('click', () => {
    if (notWorkBtn.classList.contains('route__filter--chosen')) {
      notWorkBtn.classList.remove('route__filter--chosen')
      state['routesFilters'].unstarted = false
      getOrders()
      return
    }

    try {
      document.querySelector('.route__filter--chosen').classList.remove('route__filter--chosen')
    } catch {
    }
    notWorkBtn.classList.add('route__filter--chosen')

    state['routesFilters'].unstarted = true
    state['routesFilters'].started = false
    state['routesFilters'].error = false
    state['routesFilters'].completed = false
    state['routesFilters'].planned = false

    deleteOrders()
    const filters = state['currentTopFilters'].map(filter => filter.name)
    notInWorkFilter(filters)
  })

  inErrorBtn.addEventListener('click', e => {
    if (inErrorBtn.classList.contains('route__filter--chosen')) {
      inErrorBtn.classList.remove('route__filter--chosen')
      state['routesFilters'].error = false
      getOrders()
      return
    }

    state['routesFilters'].error = true
    state['routesFilters'].started = false
    state['routesFilters'].unstarted = false
    state['routesFilters'].completed = false
    state['routesFilters'].planned = false

    try {
      document.querySelector('.route__filter--chosen').classList.remove('route__filter--chosen')
    } catch {
    }
    inErrorBtn.classList.add('route__filter--chosen')

    deleteOrders()
    const filters = state['currentTopFilters'].map(filter => filter.name)
    errFilter(filters)
  })

  completedBtn.addEventListener('click', e => {
    if (completedBtn.classList.contains('route__filter--chosen')) {
      completedBtn.classList.remove('route__filter--chosen')
      state['routesFilters'].completed = false
      getOrders()
      return
    }

    try {
      document.querySelector('.route__filter--chosen').classList.remove('route__filter--chosen')
    } catch {
    }
    completedBtn.classList.add('route__filter--chosen')

    state['routesFilters'].completed = true
    state['routesFilters'].unstarted = false
    state['routesFilters'].started = false
    state['routesFilters'].error = false
    state['routesFilters'].planned = false

    deleteOrders()
    const filters = state['currentTopFilters'].map(filter => filter.name)
    completedFilter(filters)
  })

  inPlanDate.addEventListener('change', () => {
    state.inPlanDate = inPlanDate.value
  })

  let today = getTime()
  today = today.substring(0, today.length - 6)
  inPlanDate.value = today
  inPlanDate.setAttribute('min', today)

  state.inPlanDate = inPlanDate.value
  inPlanBtn.addEventListener('click', e => {
    if (inPlanBtn.classList.contains('route__filter--chosen')) {
      inPlanBtn.classList.remove('route__filter--chosen')
      inPlanDate.value = today
      state.inPlanDate = today
      console.log(state.inPlanDate)
      state['routesFilters'].planned = false
      getOrders()
      return
    }

    try {
      document.querySelector('.route__filter--chosen').classList.remove('route__filter--chosen')
    } catch {
    }
    inPlanBtn.classList.add('route__filter--chosen')

    state['routesFilters'].planned = true
    state['routesFilters'].started = false
    state['routesFilters'].unstarted = false
    state['routesFilters'].error = false
    state['routesFilters'].completed = false

    deleteOrders()
    const filters = state['currentTopFilters'].map(filter => filter.name)
    plannedFilter(filters, inPlanDate.value)
  })
}


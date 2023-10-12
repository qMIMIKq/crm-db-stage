import {state} from "../state";

export const filterRoutesState = route => {
  let flag = false

  if (state['routesFilters'].started) {
    console.log('started')
    if (route.start_time && !route.end_time) {
      flag = true
    }
  } else if (state['routesFilters'].error) {
    console.log('error')
    if (route.error_msg) {
      flag = true
    }
  } else if (state['routesFilters'].completed) {
    console.log('error')
    if (route.end_time) {
      flag = true
    }
  } else if (state['routesFilters'].unstarted) {
    console.log('unstarted')
    if (!route.start_time) {
      flag = true
    }
  } else if (state['routesFilters'].planned) {
    console.log('planned')
    const date = document.querySelector('.header-routes__planned-date')

    if (route.plan_dates) {
      if (route.plan_dates.includes(date.value)) {
        flag = true
      }
    }

  } else {
    flag = true
  }

  return flag
}
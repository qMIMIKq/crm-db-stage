import {state} from "../state";

export const filterRoutesState = route => {
  let flag = false

  if (state['routesFilters'].started) {
    if (route.start_time && !route.end_time) {
      flag = true
    }
  } else if (state['routesFilters'].error) {
    if (route.error_msg) {
      flag = true
    }
  } else if (state['routesFilters'].completed) {
    if (route.end_time) {
      flag = true
    }
  } else if (state['routesFilters'].unstarted) {
    if (!route.start_time) {
      flag = true
    }
  } else if (state['routesFilters'].paused) {
    if (!route.error_msg && route.pause_time) {
      flag = true
    }
  } else if (state['routesFilters'].uncompleted) {
    if (!route.end_time) {
      flag = true
    }

  } else {
    flag = true
  }


// else if (state['routesFilters'].planned) {
//     const date = document.querySelector('.header-routes__planned-date')
//
//     if (route.plan_dates) {
//       if (route.plan_dates.includes(date.value)) {
//         flag = true
//       }
//     }
//
//   } else if (state['routesFilters'].alert) {
//     if (route.alert_color && route.alert_color === document.querySelector('.header-routes__alert').value) {
//       flag = true
//     }
//   }

  return flag
}

export const filterRouteStateGlobal = route => {
  let flag = false
  let globalFlag = false

  let started, error, competed, unstarted, paused, uncompleted = false

  if (state['routesFilters'].started) {
    started = !!(route.start_time && !route.end_time)
  } else {
    started = true
  }

  if (state['routesFilters'].error) {
    error = !!route.error_msg
  } else {
    error = true
  }

  if (state['routesFilters'].completed) {
    competed = !!route.end_time
  } else {
    competed = true
  }

  if (state['routesFilters'].unstarted) {
    unstarted = !route.start_time;
  } else {
    unstarted = true
  }

  if (state['routesFilters'].paused) {
    paused = !!(route.pause_time)
  } else {
    paused = true
  }

  if (state['routesFilters'].uncompleted) {
    uncompleted = !route.end_time
  } else {
    uncompleted = true
  }

  globalFlag = started && competed && paused && uncompleted && unstarted && error

  return globalFlag
}
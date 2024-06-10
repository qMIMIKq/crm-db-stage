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
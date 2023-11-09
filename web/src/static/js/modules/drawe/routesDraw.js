import {getTime} from "../getTime";
import {state} from "../state";

export const colorRoutes = (routes, parent) => {
  const routesWrapper = parent.querySelector(".table-routes__wrapper")
  const routesIssuedWrapper = parent.querySelector(".table-routes__issued")

  let date
  if (!state.inPlanDate) {
    date = getTime()
    date = date.substring(0, date.length - 5).trim()
  } else {
    date = state.inPlanDate
  }

  routes.forEach(route => {
    const dataInput = routesWrapper.querySelector(`input[name=route-${route.route_position}]`)
    const dataIssuedInput = routesIssuedWrapper.querySelector(`input[name=route-${route.route_position}-issued]`)
    if (dataInput) {
      const infoParent = dataInput.parentNode
      const routeInfo = infoParent.querySelector(`input[value="-"]`)
      routeInfo.classList.remove('route', 'route--started', 'route--completed', 'route--error', 'route--paused', 'route--planned', 'route--inplan')
      routeInfo.parentNode.classList.remove('route--inplan')

      dataInput.value = JSON.stringify(route)
      routeInfo.value = route.plot
      routeInfo.classList.add('route')

      if (route.plan_dates) {

        if (route.plan_dates.includes(date)) {
          routeInfo.classList.add('route--planned')
          routeInfo.parentNode.classList.add('route--inplan')
        }
      }

      if (route.last_comment) {
        routeInfo.classList.add('route')
        infoParent.setAttribute('data-title', `${route.last_comment}/-_/`)
        infoParent.classList.add('table-body__trattr')
      }

      if (route.start_time) {
        routeInfo.classList.add('route')
        routeInfo.classList.add('route--started')
      }

      if (route.end_time) {
        routeInfo.classList.add('route')
        routeInfo.classList.add('route--completed')
        routeInfo.classList.remove('route--started')
      }

      if (route.error_msg) {
        routeInfo.classList.add('route')
        routeInfo.classList.add('route--error')
        routeInfo.classList.remove('route--started')
        routeInfo.classList.remove('route--completed')
        infoParent.setAttribute('data-title', `${route.last_comment}/-_/${route.error_msg}`)
      }


      if (route.pause_time) {
        routeInfo.classList.add('route')
        routeInfo.classList.add('route--paused')
        routeInfo.classList.remove('route--error')
        routeInfo.classList.remove('route--started')
        routeInfo.classList.remove('route--completed')
      }
    }

    if (dataIssuedInput) {
      dataIssuedInput.value = route["issued"]
    }
  })
}
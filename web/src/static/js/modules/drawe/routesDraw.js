import {getTime} from "../getTime";
import {state} from "../state";
import {triggerRoutesModal} from "../modals/routesModal";

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
    let dataInput

    if (Number(route.route_position) > 10) {
      console.log(route.route_position)
      dataInput = routesWrapper.querySelector(`input[name=route-${route.route_position}]`)
      if (!dataInput) {
        const lastRoute = routesWrapper.querySelector('.table__route:last-of-type')
        const lastPos = Number(lastRoute.querySelector('.hidden__input').name.split('-')[1]) + 1
        lastRoute.insertAdjacentHTML('afterend', `
          <li class="table-body_cell table-body__helper table__route">
              <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
              <input readonly class="hidden__input table__data" name="route-${route.route_position}" type="text" value="" tabindex="-1" autocomplete="off">
          </li>
        `)

        // let newRoute = routesWrapper.querySelector('.table__route:last-of-type')
        // newRoute.addEventListener('click', e => triggerRoutesModal(e))
      }
    }

    dataInput = routesWrapper.querySelector(`input[name=route-${route.route_position}]`)
    const dataIssuedInput = routesIssuedWrapper.querySelector(`input[name=route-${route.route_position}-issued]`)

    if (dataInput) {
      const infoParent = dataInput.parentNode
      const routeInfo = infoParent.querySelector(`input[value="-"]`)
      routeInfo.classList.remove('route', 'route--started', 'route--completed', 'route--error', 'route--paused', 'route--planned', 'route--inplan')
      routeInfo.parentNode.classList.remove('route--inplan')

      dataInput.value = JSON.stringify(route)
      routeInfo.value = route.plot
      routeInfo.classList.add('route')

      // console.log(parent)
      // console.log(route.plan_dates)
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

      if (route.alert_color && route.alert_color !== '') {
        routeInfo.style.cssText = `color: ${route.alert_color} !important;`
      } else {
        routeInfo.style.cssText = ''
      }
    }

    if (dataIssuedInput) {
      dataIssuedInput.value = route["issued"]
    }
  })
}
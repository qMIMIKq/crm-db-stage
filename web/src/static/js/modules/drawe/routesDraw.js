import {getTime} from "../getTime";
import {state} from "../state";

export const colorRoutes = (routes, parent) => {
  const routesWrapper = parent.querySelector(".table-routes__wrapper")
  const routesIssuedWrapper = parent.querySelector(".table-routes__issued")
  const scrollPrev = parent.querySelector('.routes-btn__prev')
  const scrollNext = parent.querySelector('.routes-btn__next')

  // console.log(scrollPrev, scrollNext)

  let date
  if (!state.inPlanDate) {
    date = getTime()
    date = date.substring(0, date.length - 5).trim()
  } else {
    date = state.inPlanDate
  }

  let checkScroll = false
  routes.forEach(route => {
    let dataInput
    const pos = Number(route.route_position)

    if (pos > 10) {
      checkScroll = true
      dataInput = routesWrapper.querySelector(`input[name=route-${route.route_position}]`)
      if (!dataInput) {
        const lastRoute = routesWrapper.querySelector('.table__route:last-of-type')
        const lastPos = Number(lastRoute.querySelector('.hidden__input').name.split('-')[1]) + 1
        lastRoute.insertAdjacentHTML('afterend', `
          <li class="table-body_cell more-them-ten hidden-input--route table-body__helper table__route">
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

    const next = routesWrapper.querySelector('.hidden-input--route-next')
    const nextScroll = routesWrapper.querySelector('.hidden-input--route')
    const prev = routesWrapper.querySelector('.hidden-input--route-prev')

    if (!checkScroll) {
      scrollNext.setAttribute('disabled', true)
      scrollPrev.setAttribute('disabled', true)
    } else {
      if (!next) {
        scrollNext.removeAttribute('disabled')
        scrollNext.classList.add('routes-btn--active')
      } else if (nextScroll) {
        scrollNext.removeAttribute('disabled')
        scrollNext.classList.add('routes-btn--active')
      }

      if (prev) {
        scrollPrev.removeAttribute('disabled')
        scrollPrev.classList.add('routes-btn--active')
      }
    }
  })

  parent.querySelectorAll('.more-them-ten').forEach(elem => {
    const plot = elem.querySelector('.click-chose')
    if (plot.value === '-') {
      let lastRoute = parent.querySelectorAll('.hidden-input--route-prev')
      lastRoute = lastRoute[lastRoute.length - 1]
      try {
        lastRoute.classList.remove('hidden-input--route-prev')
      } catch {
      }
      elem.remove()
    }

    // console.log(elem)
  })
}
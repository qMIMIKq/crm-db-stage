import {getTime} from "../getTime";
import {state} from "../state";

export const colorRoutes = (routes) => {
  const routesWrapper = document.querySelector(".table-routes__wrapper")
  const routesIssuedWrapper = document.querySelector(".table-routes__issued")

  let date
  if (!state.inPlanDate) {
    date = getTime()
    date = date.substring(0, date.length - 5).trim()
  } else {
    date = state.inPlanDate
  }

  console.log(date)
  const dateToday = new Date(date).getTime()

  routes.forEach(route => {
    const dataInput = routesWrapper.querySelector(`input[name=route-${route.route_position}]`)
    const dataIssuedInput = routesIssuedWrapper.querySelector(`input[name=route-${route.route_position}-issued]`)

    if (dataInput) {
      const infoParent = dataInput.parentNode
      const routeInfo = infoParent.querySelector(`input[value="-"]`)

      dataInput.value = JSON.stringify(route)
      routeInfo.value = route.plot

      if (route.plan_date) {
        let planDate = new Date(route.plan_date).getTime()
        let planStart = new Date(route.plan_start).getTime()


        if (planStart <= dateToday && dateToday <= planDate && !route.exclude_days.includes(date)) {
          routeInfo.classList.add('route--planned')
        }
      }

      if (route.last_comment) {
        infoParent.setAttribute('data-title', `${route.last_comment} /`)
        infoParent.classList.add('table-body__trattr')
      }

      if (route.start_time && !route.end_time) {
        routeInfo.classList.add('route--started')

        if (route.issued && route.quantity && route.issued >= route.quantity) {
          routeInfo.style.color = "rgb(0 207 0)"
        } else {
          routeInfo.style.color = "black"
        }
      }

      if (route.end_time) {
        routeInfo.classList.add('route--completed')
        routeInfo.classList.remove('route--started')

        if (route.error_msg) {
          routeInfo.style.color = "red"
          infoParent.setAttribute('data-title', `${route.last_comment}/${route.error_msg}`)
          // console.log(route.comments)
        } else if (route.quantity && route.issued < route.quantity) {
          routeInfo.style.color = "yellow"
        } else {
          routeInfo.style.color = "black"
        }
      }

      if (route.error_msg && !route.end_time) {
        routeInfo.classList.add('route--error')
        infoParent.setAttribute('data-title', `${route.last_comment}/${route.error_msg}`)
        // console.log(route.comments)

        if (route.start_time) {
          routeInfo.style.color = "black"
          routeInfo.classList.remove('route--started')

          if (route.issued && route.quantity && route.issued >= route.quantity) {
            routeInfo.style.color = "#07e807"
          }
        }
      }

      if (route.pause_time) {
        routeInfo.classList.add('route--paused')
        routeInfo.style.color = 'black'

        routeInfo.classList.remove('route--error')
        routeInfo.classList.remove('route--started')
        routeInfo.classList.remove('route--completed')

        if (route.start_time) {
          routeInfo.style.color = "yellow"
        }
        if (route.error_msg) {
          routeInfo.style.color = "red"
        }
      }
    }

    if (dataIssuedInput) {
      dataIssuedInput.value = route["issued"]
    }
  })
}
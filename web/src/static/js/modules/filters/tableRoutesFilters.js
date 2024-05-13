import {state} from "../state";
import {getOrders} from "../getOrders";
import {getTime} from "../getTime";
import {newAllFilter} from "./newAllFilter";
import {colorRoutes} from "../drawe/routesDraw";
import {drawOrders, table} from "../drawe/drawOrders";

export const inArchiveBtn = document.querySelector('.header-routes__archived')
export const archiveFrom = document.querySelector('.header-routes__planned-date__from')
export const archiveTo = document.querySelector('.header-routes__planned-date__to')

export const alertFilter = color => {
  state.orders.forEach(order => {
    const hiddenOrder = document.querySelector(`#form-${order.id}`)
    if (hiddenOrder !== null) {
      hiddenOrder.classList.remove('hidden__input')
      hiddenOrder.classList.add('showed-order')
      if (order.db_routes && order.db_routes.length) {
        colorRoutes(order.db_routes, hiddenOrder)
      } else {
        drawOrders(table, `afterbegin`, order, state.orders, state.managers)
      }
    }
  })
}

export const tableRoutesFiltersHandler = () => {
  const inPlanBtn = document.querySelector(".header-routes__planned")
  const alertStatusBtn = document.querySelector('.header-routes__alert')
  const routesStatusBtn = document.querySelector('.header-routes__filter-status')
  const headerControl = document.querySelector('.header-button__control')
  const headerControlContent = document.querySelector('.header-control__content')

  const check = () => {
    headerControlContent.classList.remove('header-control__content--active')
    headerControl.querySelectorAll('.header-control__content-btn').forEach(btn => btn.classList.add('hidden-input'))
  }

  let action
  const controlChoseMap = {
    'Копировать': '#order__copy',
    'Удалить': ''
  }

  let currentForm = null,
    orderCopyBtn = null,
    orderDelBtn = null,
    orderArchiveBtn = null

  const copyBtn = headerControlContent.querySelector('#header-control__btn-copy')
  const deleteBtn = headerControlContent.querySelector('#header-control__btn-delete')
  const archiveBtn = headerControlContent.querySelector('#header-control__btn-archive')

  copyBtn.addEventListener('click', () => orderCopyBtn.click())
  deleteBtn.addEventListener('click', () => orderDelBtn.click())
  archiveBtn.addEventListener('click', () => orderArchiveBtn.click())

  headerControl.addEventListener('click', e => {
    headerControlContent.classList.add('header-control__content--active')
    headerControlContent.querySelectorAll('.header-control__content-btn').forEach(btn => btn.classList.add('hidden-input'))

    if (state.currentOrder) {
      currentForm = document.querySelector(`#form-${state.currentOrder}`)
      orderCopyBtn = currentForm.querySelector('#order__copy')
      orderDelBtn = currentForm.querySelector('#order__delete')
      orderArchiveBtn = currentForm.querySelector('.table__complete')

      copyBtn.classList.remove('hidden-input')

      if (orderDelBtn) {
        deleteBtn.classList.remove('hidden-input')
      }

      if (orderArchiveBtn) {
        archiveBtn.classList.remove('hidden-input')
      }

      // console.log(currentForm)
    }
  })
  // headerControl.addEventListener('mouseleave', check)
  if (state.adminCheck || state.manCheck) {
  } else {
    headerControl.remove()
  }

  // const headerFilters = document.querySelector('.header-filters')
  // const headerFiltersContent = document.querySelector('.header-filters__content')
  // const planDatesInput = document.querySelector('.header-routes__planned-date')
  //
  // const checkFilters = () => {
  //   headerFiltersContent.classList.add('hidden-input')
  // }
  //
  // planDatesInput.addEventListener('focus', () => {
  //   console.log('hi')
  //   headerFilters.removeEventListener('mouseleave', checkFilters)
  // })
  //
  // planDatesInput.addEventListener('blur', () => {
  //   console.log('not hi')
  //   headerFilters.addEventListener('mouseleave', checkFilters)
  // })
  //
  // headerFilters.addEventListener('mouseenter', () => {
  //   headerFiltersContent.classList.remove('hidden-input')
  // })
  // headerFilters.addEventListener('mouseleave', checkFilters)

  routesStatusBtn.addEventListener('change', e => {
    const value = e.target.value.split('-')
    if (value[0] !== '') {
      try {
        document.querySelector('.route__filter--chosen').classList.remove('route__filter--chosen')
        alertStatusBtn.style.color = ''
        alertStatusBtn.value = ''
      } catch {
      }


      // document.querySelector(`.${e.target.value}`).click()
      routesStatusBtn.style.cssText = `
        border: 2px solid ${value[1]};
        color: ${value[1]};
      `
      state.routesFilters = {}
      state.routesFilters[value[0]] = true
      newAllFilter()
    } else {
      // document.querySelector('.route__filter--chosen').click()
      routesStatusBtn.style.cssText = `
        border: 1px solid rgb(203, 203, 203);
        color: rgb(66, 66, 66);
      `

      state.routesFilters = {}
      newAllFilter()
    }
  })


  alertStatusBtn.addEventListener('change', e => {
    const value = e.target.value
    alertStatusBtn.style.color = value

    if (value === '') {
      alertStatusBtn.classList.remove('route__filter--chosen')
      state['routesFilters'] = {}
    } else {
      routesStatusBtn.value = ''
      routesStatusBtn.style.cssText = `
          border: none;
          color: rgb(66, 66, 66);
        `
      try {
        document.querySelector('.route__filter--chosen').classList.remove('route__filter--chosen')
      } catch {
      }

      alertStatusBtn.classList.add('route__filter--chosen')
      state['routesFilters'] = {}
      state['routesFilters'].alert = true
    }

    newAllFilter()
    // alertFilter(value)
    // console.log()
  })

  const inPlanDate = document.querySelector('.header-routes__planned-date')

  let date = getTime()
  let today = date.substring(0, date.length - 5).trim()
  let week = new Date(date)
  week.setDate(week.getDate() - 7)

  archiveFrom.value = week.toISOString().split('T')[0]
  archiveTo.value = today

  archiveFrom.setAttribute('max', archiveTo.value)
  archiveTo.setAttribute('min', archiveFrom.value)

  archiveFrom.addEventListener('change', () => {
    archiveTo.setAttribute('min', archiveFrom.value)
  })

  archiveTo.addEventListener('change', () => {
    archiveFrom.setAttribute('max', archiveTo.value)
  })

  inArchiveBtn.addEventListener('click', () => {
    console.log('hi')
    getOrders('get-old')
  })

  inPlanDate.addEventListener('change', () => {
    state.inPlanDate = inPlanDate.value

    if (inPlanBtn.classList.contains('route__filter--chosen')) {
      try {
        document.querySelector('.route__filter--chosen').classList.remove('route__filter--chosen')
        alertStatusBtn.style.color = ''
        alertStatusBtn.value = ''
        routesStatusBtn.value = ''
        routesStatusBtn.style.cssText = `
          border: none;
          color: rgb(66, 66, 66);
        `
      } catch {
      }
      inPlanBtn.classList.add('route__filter--chosen')

      state.routesFilters = {}
      state['routesFilters'].planned = true

      newAllFilter()
    }
  })


  inPlanDate.value = today
  // inPlanDate.setAttribute('min', today)

  state.inPlanDate = inPlanDate.value
  inPlanBtn.addEventListener('click', e => {
    if (inPlanBtn.classList.contains('route__filter--chosen')) {
      inPlanBtn.classList.remove('route__filter--chosen')
      inPlanDate.value = today
      state.inPlanDate = today
      state['routesFilters'] = {}
      // getOrders('get-all', true)
      newAllFilter()
      return
    }

    try {
      document.querySelector('.route__filter--chosen').classList.remove('route__filter--chosen')
      alertStatusBtn.style.color = ''
      alertStatusBtn.value = ''
      routesStatusBtn.value = ''
      routesStatusBtn.style.cssText = `
        border: none;
        color: rgb(66, 66, 66);
      `
    } catch {
    }
    inPlanBtn.classList.add('route__filter--chosen')

    state.routesFilters = {}
    state['routesFilters'].planned = true

    newAllFilter()
  })

  const routeStatus = document.querySelector('.route-status')
  const routeStatusContent = document.querySelector('.route-status__content')

  routeStatus.addEventListener('click', e => {
    console.log(routeStatusContent)
  })
}


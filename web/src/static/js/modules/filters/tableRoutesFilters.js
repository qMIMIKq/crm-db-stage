import {state} from "../state";
import {getOrders} from "../getOrders";
import {getTime} from "../getTime";
import {newAllFilter} from "./newAllFilter";

export const inArchiveBtn = document.querySelector('.header-routes__archived')
export const archiveFrom = document.querySelector('.header-routes__planned-date__from')
export const archiveTo = document.querySelector('.header-routes__planned-date__to')

export const tableRoutesFiltersHandler = () => {
  const inWorkBtn = document.querySelector(".header-routes__work")
  const notWorkBtn = document.querySelector(".header-routes__unwork")
  const inErrorBtn = document.querySelector(".header-routes__error")
  const completedBtn = document.querySelector(".header-routes__completed")
  const inPlanBtn = document.querySelector(".header-routes__planned")

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

  inWorkBtn.addEventListener('click', e => {
    if (inWorkBtn.classList.contains('route__filter--chosen')) {
      inWorkBtn.classList.remove('route__filter--chosen')
      state['routesFilters'].started = false
      // getOrders('get-all', true)
      newAllFilter()
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

    // getOrders('get-all', true)
    newAllFilter()
  })

  notWorkBtn.addEventListener('click', () => {
    if (notWorkBtn.classList.contains('route__filter--chosen')) {
      notWorkBtn.classList.remove('route__filter--chosen')
      state['routesFilters'].unstarted = false
      // getOrders('get-all', true)
      newAllFilter()
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

    newAllFilter()
  })

  inErrorBtn.addEventListener('click', e => {
    if (inErrorBtn.classList.contains('route__filter--chosen')) {
      inErrorBtn.classList.remove('route__filter--chosen')
      state['routesFilters'].error = false
      // getOrders('get-all', true)
      newAllFilter()
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

    newAllFilter()
  })

  completedBtn.addEventListener('click', e => {
    if (completedBtn.classList.contains('route__filter--chosen')) {
      completedBtn.classList.remove('route__filter--chosen')
      state['routesFilters'].completed = false
      // getOrders('get-all', true)
      newAllFilter()
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

    newAllFilter()
  })

  inPlanDate.addEventListener('change', () => {
    state.inPlanDate = inPlanDate.value
  })


  inPlanDate.value = today
  inPlanDate.setAttribute('min', today)

  state.inPlanDate = inPlanDate.value
  inPlanBtn.addEventListener('click', e => {
    if (inPlanBtn.classList.contains('route__filter--chosen')) {
      inPlanBtn.classList.remove('route__filter--chosen')
      inPlanDate.value = today
      state.inPlanDate = today
      state['routesFilters'].planned = false
      // getOrders('get-all', true)
      newAllFilter()
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

    newAllFilter()
  })
}


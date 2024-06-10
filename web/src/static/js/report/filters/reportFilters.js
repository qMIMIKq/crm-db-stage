import {state} from "../../modules/state";
import {newAllReportFilter} from "./newAllReportFilter";
import {deleteOrders} from "../../modules/getOrders";
import {getReports} from "../getReports";
import {drawReport} from "../drawReport";

export const reportFiltersWrapper = document.querySelector('.main-table__header')
export const idReportFilter = document.querySelector('#id')
export const numsReportFilter = document.querySelector('#numbers')
// export const plotsReportFilter = document.querySelector('#order_plot')
export const operatorReportFilter = document.querySelector('#operator')
export const positionReportFilter = document.querySelector('#route_position')


export const timeSortingFilter = () => {
  const sortBtn = document.querySelector('.table__timestamp--btn')
  console.log(sortBtn)
  const check = (a, b) => {
    let flag

    if (state.reportFiltersDate === '') {

    } else if (state.reportFiltersDate === 'down') {
      flag = a > b ? 1 : -1
    } else if (state.reportFiltersDate === 'up') {
      flag = a < b ? 1 : -1
    }

    return flag
  }

  sortBtn.addEventListener('click', () => {
    if (state.reportFiltersDate === '') {
      state.reportFiltersDate = 'down'
    } else if (state.reportFiltersDate === 'down') {
      state.reportFiltersDate = 'up'
    } else {
      state.reportFiltersDate = ''
      deleteOrders()
      getReports()
      return
    }

    console.log(state.reportFiltersDate)
    console.log(state.orders)
    state.orders = state.orders.sort((a, b) => {
      let aDate = a.report_date.split('T')[0]
      let bDate = b.report_date.split('T')[0]
      let flag = check(aDate, bDate)

      return flag
    })

    deleteOrders()
    state.orders.forEach(order => {
      drawReport(order)
    })
    newAllReportFilter()
    // state.orders.forEach((order, i) => {
    //   const hiddenOrder = document.querySelector(`#form-${order.report_id}`)
    //   if (hiddenOrder !== null) {
    //     hiddenOrder.classList.remove('hidden__input')
    //     hiddenOrder.classList.add('showed-order')
    //   } else {
    //     drawReport(order)
    //   }
    // })

    // state.orders.forEach(order => {
    //   console.log(order.report_date)
    // })
  })
}

export const deleteReportsFilters = () => {
  const filters = document.querySelectorAll('.table__filter--new')
  if (filters[0] !== null) {
    filters.forEach(filter => filter.remove())
  }
}

export const drawReportsFilter = (data, target) => {
  data.forEach(d => {
    target.insertAdjacentHTML('beforeend', `
        <option class='table__filter--new' value='${d}'>${d}</option>
    `)
  })
}

export const bindReportsFilters = () => {
  timeSortingFilter()

  const tableFilters = document.querySelectorAll('.table__filter')
  const filterWrappers = document.querySelectorAll('.table__use label')

  filterWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', e => {
      const select = wrapper.parentNode.querySelector('select')
      wrapper.classList.add('hidden__input')
      select.classList.remove('hidden__input')
    })
  })

  tableFilters.forEach(filter => {
    filter.addEventListener('blur', e => {
      showFilter(e)
    })
  })

  bindFilter(idReportFilter)
  bindFilter(numsReportFilter)
  bindFilter(reportFiltersWrapper)
  bindFilter(positionReportFilter)
  bindFilter(operatorReportFilter)
}

const showFilter = e => {
  const target = e.target
  state['filtered'] = true
  const label = target.parentNode.querySelector('label')
  target.classList.add('hidden__input')
  label.classList.remove('hidden__input')
}

const filterReports = (type, filter) => {
  state['filtered'] = true
  state['tableFilters'][type] = filter
  console.log(type, filter)

  newAllReportFilter(false)
}

const bindFilter = (elem) => {
  elem.removeEventListener('change', filterListener)
  elem.addEventListener('change', filterListener)
}

const filterListener = (e) => {
  showFilter(e)
  filterReports(e.target.parentNode.querySelector(".filter__type").value, e.target.value)
  setChosenFilter(e)
}

export const controlReportsFiltersReset = () => {
  if (state['filtered']) {
    const nav = document.querySelector('.main-header__nav')
    const resetBtn = nav.querySelector('.header-button__reset')
    if (resetBtn === null) {
      nav.insertAdjacentHTML('beforeend', `
          <button class='main__button--click main-header__button header-button__reset' tabindex='-1'>Сбросить фильтры</button>
      `)

      nav.querySelector('.header-button__reset').addEventListener('click', e => {
        state['filtered'] = false
        state['searched'] = false
        state['tableFilters'] = {}
        document.querySelectorAll('.route__filter--chosen').forEach(filt => filt.classList.remove('route__filter--chosen'))

        reportFiltersWrapper.querySelectorAll(".table__cell label").forEach(cell => {
          cell.style.textDecoration = 'none'
        })

        newAllReportFilter(false)
      })
    }
  } else {
    const resetBtn = document.querySelector('.header-button__reset')
    if (resetBtn !== null) {
      resetBtn.remove()
    }
  }
}

const setChosenFilter = e => {
  if (state['filtered']) {
    e.target.parentNode.querySelector('label').style.textDecoration = 'underline'
  } else {
    e.target.parentNode.querySelector('label').style.textDecoration = 'none'
  }
}
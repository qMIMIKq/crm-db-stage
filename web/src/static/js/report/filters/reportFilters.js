import {state} from "../../modules/state";
import {deleteOrders} from "../../modules/orders";
import {bindOrdersListeners} from "../../modules/bindListeners";
import {drawReport} from "../drawReport";
import {getReports} from "../getReports";

export const reportFiltersWrapper = document.querySelector('.main-table__header')
export const idReportFilter = document.querySelector('#id')
export const numsReportFilter = document.querySelector('#numbers')
export const plotsReportFilter = document.querySelector('#order_plot')


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
  state['reportFilters'][type] = filter
  console.log(type, filter)
  console.log(state['reportFilters'])

  deleteOrders()
  state['reports'].forEach(o => {
    globalFilterReports(o, [])
  })

  bindOrdersListeners()
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
          <button class='main__button main-header__button header-button__reset' tabindex='-1'>Сбросить фильтры</button>
      `)

      nav.querySelector('.header-button__reset').addEventListener('click', e => {
        state['filtered'] = false
        state['reportFilters'] = {}
        document.querySelectorAll('.route__filter--chosen').forEach(filt => filt.classList.remove('route__filter--chosen'))

        reportFiltersWrapper.querySelectorAll(".table__cell label").forEach(cell => {
          cell.style.textDecoration = 'none'
        })
        getReports('get-all')
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

export const globalFilterReports = (report, topFilters) => {
  console.log(state.reportFilters)

  let flag = true
  for (let type in state['reportFilters']) {
    const filter = state['reportFilters'][type]

    if (filter === 'все') {
    } else if (filter) {
      console.log(report[type], state['reportFilters'][type])
      if (!(report[type] == state['reportFilters'][type])) {
        flag = false
        break
      }
    }
  }

  console.log(report)

  if (flag) {
    drawReport(report, state['filteredReport'], state['managers'])
  }

  return flag
}
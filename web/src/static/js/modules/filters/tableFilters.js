import {getOrders} from '../getOrders';
import {state} from '../state';
import {newAllFilter} from "./newAllFilter";


export const tableFiltersWrapper = document.querySelector('.main-table__header')
export const numsFilter = tableFiltersWrapper.querySelector('#numbers')
export const clientsFilter = tableFiltersWrapper.querySelector('#clients')
export const materialsFilter = tableFiltersWrapper.querySelector('#materials')
export const namesFilter = tableFiltersWrapper.querySelector("#name")
export const quantityFilter = tableFiltersWrapper.querySelector("#quantity")
export const issuedFilter = tableFiltersWrapper.querySelector("#issued")
export const managerFilter = tableFiltersWrapper.querySelector("#m")
export const deadlineFilter = tableFiltersWrapper.querySelector("#end_time")
export const timestampFilter = tableFiltersWrapper.querySelector("#timestamp")

export const deleteTableFilters = () => {
  const filters = document.querySelectorAll('.table__filter--new')
  if (filters[0] !== null) {
    filters.forEach(filter => filter.remove())
  }
}

export const drawTableFilter = (data, target) => {
  data.forEach(d => {
    target.insertAdjacentHTML('beforeend', `
            <option class='table__filter--new' value='${d}'>${d}</option>
        `)
  })
}

export const bindTableFilters = () => {
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

  bindFilter(numsFilter)
  bindFilter(clientsFilter)
  bindFilter(materialsFilter)
  bindFilter(namesFilter)
  bindFilter(quantityFilter)
  bindFilter(issuedFilter)
  bindFilter(managerFilter)
  bindFilter(deadlineFilter)
  bindFilter(timestampFilter)
}

const showFilter = e => {
  const target = e.target
  state['filtered'] = true
  const label = target.parentNode.querySelector('label')
  target.classList.add('hidden__input')
  label.classList.remove('hidden__input')
}

export const filterOrders = (type, filter) => {
  state['filtered'] = true
  state['tableFilters'][type] = filter
  newAllFilter()
}

const bindFilter = (elem) => {
  elem.removeEventListener('change', filterListener)
  elem.addEventListener('change', filterListener)
}

const filterListener = (e) => {
  showFilter(e)
  filterOrders(e.target.parentNode.querySelector(".filter__type").value, e.target.value)
  setChosenFilter(e)
}

export const controlFiltersReset = () => {
  if (state['filtered']) {
    const nav = document.querySelector('.main-header__nav')
    const spinner = document.querySelector('.spinner-loader')
    const resetBtn = nav.querySelector('.header-button__reset')
    if (resetBtn === null) {
      spinner.insertAdjacentHTML('beforebegin', `
          <button class='main__button--click main-header__button header-button__reset' tabindex='-1'>Сбросить фильтры</button>
      `)

      nav.querySelector('.header-button__reset').addEventListener('click', e => {
        state['filtered'] = false
        state['searched'] = false
        state['tableFilters'] = {}
        // document.querySelectorAll('.route__filter--chosen').forEach(filt => filt.classList.remove('route__filter--chosen'))

        tableFiltersWrapper.querySelectorAll(".table__cell label").forEach(cell => {
          cell.style.textDecoration = 'none'
        })
        getOrders('get-all', true)
        newAllFilter()
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
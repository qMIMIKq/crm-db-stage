import {
  bindTableFilters,
  clientsFilter,
  deleteTableFilters,
  drawTableFilter,
  materialsFilter,
  namesFilter,
  numsFilter
} from './filters/tableFilters';
import {state} from './state';
import {archiveFrom, archiveTo,} from "./filters/tableRoutesFilters";
import {sendData} from "./sendData";
import {appAddr} from "../../../../../appAddr";
import {newAllFilter} from "./filters/newAllFilter";
import {drawUpdatedData} from "./drawe/drawUpdatedData";
import {bindOrdersListeners} from "./bindListeners";


export const isEmptyData = checkThis => {
  return checkThis || 'Не заполнено'
}

export const getOrders = (postfix = 'get-all', updateOnly = false) => {
  const archiveBlock = document.querySelector('.archive-block')
  const routesBlock = document.querySelector('.routes-block')
  const loader = document.querySelector('.spinner-loader')
  loader.classList.remove('hidden__input')

  const links = document.querySelectorAll('.nav-control__route-link')
  const mainLink = document.querySelector('.link__main')
  const archiveLink = document.querySelector('.link__archive')

  state['isArchive'] = postfix !== 'get-all' || sessionStorage.getItem('page') === 'archive'

  if (state.isArchive) {
    document.title = 'Архив'
    links.forEach(link => {
      link.classList.remove('nav-control__route-link--current')
    })

    archiveLink.classList.add('nav-control__route-link--current')
  } else {
    document.title = 'Заказы'
    links.forEach(link => {
      link.classList.remove('nav-control__route-link--current')
    })

    mainLink.classList.add('nav-control__route-link--current')
  }

  if (state.isArchive) {
    archiveBlock.classList.remove('hidden__input')
    routesBlock.classList.add('hidden__input')
  } else {
    archiveBlock.classList.add('hidden__input')
    routesBlock.classList.remove('hidden__input')
  }

  const params = {
    'order_old': state.isArchive,
    'archive_from': archiveFrom.value,
    'archive_to': archiveTo.value,
    'update_only': updateOnly,
    'update_time': state['maxTime'],
    'start_time': state['startTime']
  }

  sendData(`${appAddr}/api/orders/get-all`, 'POST', JSON.stringify(params))
    .then(res => res.json())
    .then(data => {
      const title = document.querySelector('.main-header__title')
      if (!data.data) {
        if (!updateOnly) {
          hideOrders()
          state.orders = data.data
          title.textContent = state.isArchive ? 'Архив пуст' : 'Журнал пуст'
          return
        }
      }

      if (data.data) {
        deleteTableFilters()
        // console.log('we have data')

        data.data.forEach(d => {
          if (state['maxTime']) {
            if (d.time_of_modify) {
              let maxGetTime = new Date(state['maxTime']).getTime()
              let dTime = new Date(d.time_of_modify).getTime()
              state['maxTime'] = dTime >= maxGetTime ? d.time_of_modify : state['maxTime']
            }
          } else {
            if (d.time_of_modify) {
              state['maxTime'] = d.time_of_modify
            }
          }

          state['nums'].push(isEmptyData(d.number))
          state['clients'].push(isEmptyData(d.client))
          state['materials'].push(isEmptyData(d.material))
          state['names'].push(isEmptyData(d.name))
        })

        if (updateOnly) {
          // console.log('update only')
          const routesStatusFilter = document.querySelector('.route__filter--chosen')
          let filtered = state.filtered || !!state.currentTopFilters.length || routesStatusFilter || state.searched
          // console.log('filtered', filtered)
          if (filtered) {
            newAllFilter()
          } else {
            bindOrdersListeners()
          }

          data.data.forEach(d => {
            drawUpdatedData(d, state.orders, filtered)
          })
        } else {
          state['orders'] = data.data
          newAllFilter(true)
        }

        state['nums'] = [...new Set(state['nums'])].sort()
        state['clients'] = [...new Set(state['clients'])].sort()
        state['materials'] = [...new Set(state['materials'])].sort()
        state['names'] = [...new Set(state['names'])].sort()

        drawTableFilter(state.nums, numsFilter)
        drawTableFilter(state.clients, clientsFilter)
        drawTableFilter(state.materials, materialsFilter)
        drawTableFilter(state.names, namesFilter)

        bindTableFilters()
      }

      loader.classList.add('hidden__input')
      if (state['isArchive']) {
        document.querySelectorAll('.table__data').forEach(field => {
          field.setAttribute("readonly", "true")
        })
      }

    })
}

export const cleanSelect = (currentOrder, select) => {
  const selectElem = currentOrder.querySelector(select)

  selectElem.querySelectorAll('option').forEach(option => {
    option.remove()
  })
}

export const deleteOrders = () => {
  const orders = document.querySelectorAll('.table-form')
  orders.forEach(order => {
    order.remove()
  })
}

export const hideOrders = () => {
  const orders = document.querySelectorAll('.table-form')
  orders.forEach(order => {
    order.classList.add('hidden__input')
    order.classList.remove('showed-order')
  })
}

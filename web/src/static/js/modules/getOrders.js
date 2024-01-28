import {deleteTableFilters} from './filters/tableFilters';
import {state} from './state';
import {getData} from './getData';
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

  // console.time('get orders')

  // console.log('start time', state.maxTime)
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
      // console.timeEnd('get orders')
      const title = document.querySelector('.main-header__title')

      // console.time('draw orders')

      if (!data.data) {
        if (!updateOnly) {
          hideOrders()
          state.orders = data.data
          title.textContent = state.isArchive ? 'Архив пуст' : 'Журнал пуст'
          return
        }
        // title.textContent = state.isArchive ? `Архив заказов (${state.orders.length})` : `Журнал заказов (${state.orders.length})`

        // document.querySelector('.nav-control__total').textContent = `Всего в ${state.isArchive ? 'архиве' : 'работе'} 0`
      }

      getData('users/get-managers')
        .then(res => {
          deleteTableFilters()
          // deleteOrders()

          if (data.data) {
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

              // state['nums'].push(isEmptyData(d.number))
              // state['clients'].push(isEmptyData(d.client))
              // state['materials'].push(isEmptyData(d.material))
              // state['names'].push(isEmptyData(d.name))
              // state['quantity'].push(isEmptyData(d.quantity))
              // state['issued'].push(isEmptyData(d.issued))
              // state['managers'].push(isEmptyData(d.m))
              // state['deadlines'].push(d.end_time ? isEmptyData(d.end_time.split('T')[0]) : 'Не заполнено')
              // state['timestamps'].push(d.timestamp.split('T')[0])

              if (!state['filtered']) {
                state['managers'] = res.data.map(user => user.nickname)
              }
            })

            if (updateOnly) {
              const routesStatusFilter = document.querySelector('.route__filter--chosen')
              let filtered = state.filtered || !!state.currentTopFilters.length || routesStatusFilter
              data.data.forEach(d => {
                drawUpdatedData(d, state.orders, filtered)
              })

              if (filtered) {
                newAllFilter()
              } else {
                bindOrdersListeners()
              }

              // title.textContent = state.isArchive ? `Архив заказов (${state.orders.length})` : `Журнал заказов (${state.orders.length})`
            } else {
              // title.textContent = state.isArchive ? `Архив заказов (${state.orders.length})` : `Журнал заказов (${state.orders.length})`
              state['orders'] = data.data
              state['filteredOrders'] = state['orders'].filter(o => o)
              newAllFilter(true)
            }
          }

          // console.timeEnd('draw orders')

          // console.time('add filters and listeners')
          // drawTableFilter([...new Set(state['nums'])].sort(), numsFilter)
          // drawTableFilter([...new Set(state['clients'])].sort(), clientsFilter)
          // drawTableFilter([...new Set(state['materials'])].sort(), materialsFilter)
          // drawTableFilter([...new Set(state['names'])].sort(), namesFilter)
          // drawTableFilter([...new Set(state['quantity'])].sort(), quantityFilter)
          // drawTableFilter([...new Set(state['issued'])].sort(), issuedFilter)
          // drawTableFilter([...new Set(state['managers'])].sort(), managerFilter)
          // drawTableFilter([...new Set(state['deadlines'])].sort(), deadlineFilter)
          // drawTableFilter([...new Set(state['timestamps'])].sort(), timestampFilter)
          // bindTableFilters()

          // console.timeEnd('add filters and listeners')

          // title.textContent = state.isArchive ? `Архив заказов (${state.orders.length})` : `Журнал заказов (${state.orders.length})`
          loader.classList.add('hidden__input')
          if (state['isArchive']) {
            document.querySelectorAll('.table__data').forEach(field => {
              field.setAttribute("readonly", "true")
            })
          }

          // const lastOrder = document.querySelector('.table__data--chosen')
          // if (lastOrder) {
          //   lastOrder.scrollIntoView({block: 'center'})
          // }

          // document.querySelectorAll(".table-form").forEach(form => {
          //   form.addEventListener('click', e => {
          //     console.log("I am form hi)")
          //   })
          // })
        })
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
  // document.querySelector('.orders__total').remove()

  orders.forEach(order => {
    order.remove()
  })
}

export const hideOrders = () => {
  const orders = document.querySelectorAll('.table-form')
  // document.querySelector('.orders__total').remove()

  orders.forEach(order => {
    order.classList.add('hidden__input')
    order.classList.remove('showed-order')
  })
}

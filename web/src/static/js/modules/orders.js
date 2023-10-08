import {
  bindTableFilters,
  clientsFilter,
  deadlineFilter,
  deleteTableFilters,
  drawTableFilter,
  issuedFilter,
  managerFilter,
  materialsFilter,
  namesFilter,
  numsFilter,
  quantityFilter,
  timestampFilter
} from './filters/tableFilters';
import {state} from './state';
import {bindOrdersListeners} from './bindListeners';
import {getData} from './getData';
import {globalFilterOrders} from "./filters/filterOrders";
import {drawOrders} from "./drawOrders";
import {filterData} from "./filters/topFilters";
import {
  archiveFrom,
  archiveTo,
  completedFilter,
  errFilter,
  notInWorkFilter,
  plannedFilter,
  startFilter
} from "./filters/tableRoutesFilters";
import {getTime} from "./getTime";
import {sendData} from "./sendData";
import {appAddr} from "./appAddr";

export const getOrders = (postfix = 'get-all') => {
  const archiveBlock = document.querySelector('.archive-block')
  const routesBlock = document.querySelector('.routes-block')
  document.querySelector('.main-header__title').textContent = 'Обновляем таблицу...'

  const links = document.querySelectorAll('.nav-control__route-link')
  const mainLink = document.querySelector('.link__main')
  const archiveLink = document.querySelector('.link__archive')

  state['isArchive'] = postfix !== 'get-all' || sessionStorage.getItem('page') === 'archive'
  const filters = state['currentTopFilters'].map(filter => filter.name)

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

  console.time('get orders')

  const params = {
    'order_old': state.isArchive,
    'archive_from': archiveFrom.value,
    'archive_to': archiveTo.value,
  }

  sendData(`${appAddr}/api/orders/get-all`, 'POST', JSON.stringify(params))
    .then(res => res.json())
    .then(data => {
      if (state.isArchive) {
        archiveBlock.classList.remove('hidden__input')
        routesBlock.classList.add('hidden__input')
      } else {
        archiveBlock.classList.add('hidden__input')
        routesBlock.classList.remove('hidden__input')
      }

      const title = document.querySelector('.main-header__title')

      if (!data.data) {
        deleteOrders()
        state.orders = data.data
        title.textContent = state.isArchive ? 'Архив пуст' : 'Журнал пуст'
        // document.querySelector('.nav-control__total').textContent = `Всего в ${state.isArchive ? 'архиве' : 'работе'} 0`
        return
      } else {
        title.textContent = state.isArchive ? `Архив заказов (${data.data.length})` : `Журнал заказов (${data.data.length})`
      }

      const nums = []
      const clients = []
      const materials = []
      const names = []
      const quantity = []
      const issued = []
      const managers = []
      const deadlines = []
      const timestamps = []

      getData('users/get-users')
        .then(res => {
          deleteTableFilters()
          deleteOrders()
          state['orders'] = data.data
          state['filteredOrders'] = state['orders'].filter(o => o)

          const isEmptyData = checkThis => {
            return checkThis || 'Не заполнено'
          }

          data.data.forEach(d => {
            nums.push(isEmptyData(d.number))
            clients.push(isEmptyData(d.client))
            materials.push(isEmptyData(d.material))
            names.push(isEmptyData(d.name))
            quantity.push(isEmptyData(d.quantity))
            issued.push(isEmptyData(d.issued))
            managers.push(isEmptyData(d.m))
            deadlines.push(d.end_time ? isEmptyData(d.end_time.split('T')[0]) : 'Не заполнено')
            timestamps.push(d.timestamp.split('T')[0])

            if (!state['filtered']) {
              state['managers'] = res.data.filter(user => user.group === 'менеджер')
            }

            if (state['filtered'] && filters.length) {
              // console.log('big filter')
              globalFilterOrders(d, filters)
              filterData()
            } else if (state['filtered']) {
              globalFilterOrders(d)
            } else if (filters.length) {
              // console.log('top filter')
              filterData()
            } else {
              // console.log('draw only')
              drawOrders(d, data, state['managers'])
            }
          })

          if (!filters.length) {
            if (state['routesFilters'].started) {
              deleteOrders()
              startFilter(filters)
            } else if (state['routesFilters'].error) {
              deleteOrders()
              errFilter(filters)
            } else if (state['routesFilters'].completed) {
              deleteOrders()
              completedFilter(filters)
            } else if (state['routesFilters'].planned) {
              let date
              if (!state.inPlanDate) {
                date = getTime()
                date = date.substring(0, date.length - 5).trim()
              } else {
                date = state.inPlanDate
              }
              deleteOrders()
              plannedFilter(filters, date)
            } else if (state['routesFilters'].unstarted) {
              deleteOrders()
              notInWorkFilter(filters)
            }
          }

          drawTableFilter([...new Set(nums)], numsFilter)
          drawTableFilter([...new Set(clients)], clientsFilter)
          drawTableFilter([...new Set(materials)], materialsFilter)
          drawTableFilter([...new Set(names)], namesFilter)
          drawTableFilter([...new Set(quantity)], quantityFilter)
          drawTableFilter([...new Set(issued)], issuedFilter)
          drawTableFilter([...new Set(managers)], managerFilter)
          drawTableFilter([...new Set(deadlines)], deadlineFilter)
          drawTableFilter([...new Set(timestamps)], timestampFilter)
          bindOrdersListeners()
          bindTableFilters()

          if (state['isArchive']) {
            document.querySelectorAll('.table__data').forEach(field => {
              field.setAttribute("readonly", "true")
            })
          }

          console.timeEnd('get orders')

          const lastOrder = document.querySelector('.table__data--chosen')
          if (lastOrder) {
            lastOrder.scrollIntoView({block: 'center'})
          }

          document.querySelectorAll(".table-form").forEach(form => {
            form.addEventListener('click', e => {
              console.log("I am form hi)")
            })
          })
        })
    })
}

export const deleteOrders = () => {
  const orders = document.querySelectorAll('.table-form')
  // document.querySelector('.orders__total').remove()

  orders.forEach(order => {
    order.remove()
  })
}

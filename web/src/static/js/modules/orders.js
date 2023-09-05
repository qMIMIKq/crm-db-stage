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
import {appAddr, state} from './state';
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

export const getOrders = (postfix = 'get-all') => {
  const archiveBlock = document.querySelector('.archive-block')
  const routesBlock = document.querySelector('.routes-block')

  const totalOrders = document.querySelector('.nav-control__total')
  state['isArchive'] = postfix !== 'get-all'

  const filters = state['currentTopFilters'].map(filter => filter.name)
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

      if (!data.data) {
        deleteOrders()
        let text = state.isArchive ? 'Архив пуст' : 'Журнал пуст'
        document.querySelector('.main-header__title').textContent = text
        text = state.isArchive ? 'Всего в архиве' : 'Всего в работе'

        if (totalOrders === null) {
          document.querySelector('.table-info').insertAdjacentHTML('afterbegin', `
          <h3 class='orders__total'>${text} 0</h3>
      `)
        } else {
          totalOrders.textContent = `${text} 0`
        }

        return
      }

      document.querySelector('.table-info').insertAdjacentHTML('beforeend', `
        <h3 class="warning">Обновляем таблицу...</h3>
    `)
      document.querySelector('.table__archive').classList.add('hidden__input')

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

          data.data.forEach(d => {
            nums.push(d.number)
            clients.push(d.client)
            materials.push(d.material)
            names.push(d.name)
            quantity.push(d.quantity)
            issued.push(d.issued)
            managers.push(d.m)
            deadlines.push(d.end_time)
            timestamps.push(d.timestamp.split('T')[0])

            if (!state['filtered']) {
              state['managers'] = res.data.filter(user => user.group === 'менеджер')
            }

            if (state['filtered'] && filters.length) {
              // console.log('big filter')
              globalFilterOrders(d, filters)
              filterData()
            } else if (state['filtered']) {
              console.log('table filter')
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
            console.log('wtf')
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

          document.querySelector('.table-info').querySelector('.warning').remove()
          if (totalOrders === null) {
            document.querySelector('.nav-control__total').textContent = `Всего в работе ${data.data.length}`
          } else {
            totalOrders.textContent = `Всего в работе ${data.data.length}`
          }
          document.querySelector('.table__archive').classList.remove('hidden__input')

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

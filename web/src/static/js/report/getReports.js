import {state} from '../modules/state';
import {sendData} from "../modules/sendData";
import {drawReport} from "./drawReport";
import {deleteOrders} from "../modules/getOrders";
import {
  bindReportsFilters,
  deleteReportsFilters,
  drawReportsFilter,
  idReportFilter,
  numsReportFilter
} from "./filters/reportFilters";
import {appAddr} from "../../../../../appAddr";
import {globalFilterReports} from "./filters/globalFilterReports";
import {filterRouteReports} from "./filters/topReportFilter";

export const getReports = () => {
  const totalOrders = document.querySelector('.orders__total')

  const from = document.querySelector(".header-routes__planned-date--report__from").value
  const to = document.querySelector(".header-routes__planned-date--report__to").value

  const links = document.querySelectorAll('.nav-control__route-link')
  const reportLink = document.querySelector('.link__report')
  document.title = 'План/Факт'
  links.forEach(link => {
    link.classList.remove('nav-control__route-link--current')
  })

  reportLink.classList.add('nav-control__route-link--current')

  let reportTime = {
    "from": from,
    "to": to
  }

  const total = document.querySelector('.main-header__title')
  total.textContent = 'Обновляем таблицу...'

  sendData(`${appAddr}/api/reports/get-all`, 'POST', JSON.stringify(reportTime))
    .then(resp => resp.json())
    .then(data => {
      state.orders = data.data
      deleteOrders()
      deleteReportsFilters()

      if (data.data) {
        total.textContent = `План/факт (${data.data.length})`
      } else {
        total.textContent = `План/факт (0)`
        return
      }


      // document.querySelector('.table__archive').classList.add('hidden__input')

      const nums = []
      const ids = []

      // deleteTableFilters()
      // deleteOrders()
      state['orders'] = data.data
      state['filteredOrders'] = state['orders'].filter(o => o)
      const filters = state['currentTopFilters'].map(filter => filter.name)
      console.log(filters)

      console.log(state.filtered)

      data.data.forEach(d => {
        nums.push(d.order_number)
        ids.push(d.order_id)

        if (state['filtered'] && filters.length) {
          // console.log('big filter')
          globalFilterReports(d, filters)
          filterRouteReports()
        } else if (state['filtered']) {
          console.log('table filter')
          globalFilterReports(d)
        } else if (filters.length) {
          console.log('top filter')
          filterRouteReports()
        } else {
          console.log('draw only')
          drawReport(d, data)
        }
      })

      drawReportsFilter([...new Set(ids)], idReportFilter)
      drawReportsFilter([...new Set(nums)], numsReportFilter)

      bindReportsFilters()
    })
}
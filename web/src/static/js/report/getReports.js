import {state} from '../modules/state';
import {sendData} from "../modules/sendData";
import {hideOrders, isEmptyData} from "../modules/getOrders";
import {
  bindReportsFilters,
  deleteReportsFilters,
  drawReportsFilter,
  idReportFilter,
  numsReportFilter,
  operatorReportFilter, positionReportFilter
} from "./filters/reportFilters";
import {appAddr} from "../../../../../appAddr";
import {newAllReportFilter} from "./filters/newAllReportFilter";

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
  const loader = document.querySelector('.spinner-loader')
  loader.classList.remove('hidden__input')

  sendData(`${appAddr}/api/reports/get-all`, 'POST', JSON.stringify(reportTime))
    .then(resp => resp.json())
    .then(data => {
      state.orders = data.data
      hideOrders()
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
      const operators = []
      const positions = []

      // deleteTableFilters()
      // deleteOrders()
      state['orders'] = data.data
      // console.log(state.orders)

      data.data.forEach(d => {
        nums.push(isEmptyData(d.order_number))
        ids.push(isEmptyData(d.order_id))
        operators.push(isEmptyData(d.operator))
        positions.push(isEmptyData(d.route_position))
      })

      newAllReportFilter(true)
      loader.classList.add('hidden__input')
      drawReportsFilter([...new Set(ids)], idReportFilter)
      drawReportsFilter([...new Set(nums)], numsReportFilter)
      drawReportsFilter([...new Set(operators)], operatorReportFilter)
      drawReportsFilter([...new Set(positions)], positionReportFilter)

      bindReportsFilters()
    })
}
import {appAddr, state} from '../modules/state';
import {sendData} from "../modules/sendData";
import {drawReport} from "./drawReport";
import {deleteOrders} from "../modules/orders";
import {
  bindReportsFilters,
  deleteReportsFilters,
  drawReportsFilter,
  idReportFilter,
  numsReportFilter, plotsReportFilter
} from "./filters/reportFilters";
import {deleteTableFilters} from "../modules/filters/tableFilters";

export const getReports = () => {
  const totalOrders = document.querySelector('.orders__total')

  const from = document.querySelector(".header-routes__planned-date--report__from").value
  const to = document.querySelector(".header-routes__planned-date--report__to").value

  let reportTime = {
    "from": from,
    "to": to
  }

  sendData(`${appAddr}/api/reports/get-all`, 'POST', JSON.stringify(reportTime))
    .then(resp => resp.json())
    .then(data => {
      state.reports = data.data
      deleteOrders()
      deleteReportsFilters()
      if (!data.data) {
        document.querySelector('.main-header__title').textContent = 'Отчет пуст'

        if (totalOrders === null) {
          document.querySelector('.table-info').insertAdjacentHTML('afterbegin', `
          <h3 class='orders__total'>Всего в отчёте 0</h3>
      `)
        } else {
          totalOrders.textContent = `Всего в отчёте 0`
        }

        return
      }

      // document.querySelector('.table-info').insertAdjacentHTML('beforeend', `
      //     <h3 class="warning">Обновляем таблицу...</h3>
      // `)
      // document.querySelector('.table__archive').classList.add('hidden__input')

      const nums = []
      const ids = []
      const plots = []

      // deleteTableFilters()
      // deleteOrders()
      state['reports'] = data.data
      state['filteredReport'] = state['orders'].filter(o => o)

      data.data.forEach(d => {
        nums.push(d.order_number)
        ids.push(d.order_id)
        plots.push(d.order_plot)

        drawReport(d, data)
      })


      drawReportsFilter([...new Set(ids)], idReportFilter)
      drawReportsFilter([...new Set(nums)], numsReportFilter)
      drawReportsFilter([...new Set(plots)], plotsReportFilter)

      bindReportsFilters()
    })
}
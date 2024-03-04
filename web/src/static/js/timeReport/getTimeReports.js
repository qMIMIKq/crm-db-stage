import {sendData} from "../modules/sendData";
import {appAddr} from "../../../../../appAddr";
import {drawTimeReports} from "./drawTimeReport";
import {deleteOrders} from "../modules/getOrders";

export const getTimeReports = () => {
  const from = document.querySelector('.header-routes__planned-date--report__from').value
  const to = document.querySelector('.header-routes__planned-date--report__to').value
  const datesRange = {
    from, to
  }


  deleteOrders()
  sendData(`${appAddr}/api/time-reports/get-all`, 'POST', JSON.stringify(datesRange))
    .then(resp => resp.json())
    .then(data => {
      if (data.data) {
        data.data.forEach(d => {
          drawTimeReports(d)
        })
      }
    })
}
import {sendData} from "../modules/sendData";
import {appAddr} from "../../../../../appAddr";
import {drawTimeReports} from "./drawTimeReport";

export const getTimeReports = () => {
  sendData(`${appAddr}/api/time-reports/get-all`, 'POST', JSON.stringify(""))
    .then(resp => resp.json())
    .then(data => {
      data.data.forEach(d => {
        drawTimeReports(d)
      })
    })
}
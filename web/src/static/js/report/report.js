import "../../css/table/table.scss"
import {getReports} from "./getReports";
import {reportRoutesDatesFilter} from "./reportRoutesDatesFilter";
import {appAddr} from "../modules/state";

export const user = JSON.parse(sessionStorage.getItem("user"))


if (window.location.href.endsWith('main/report')) {
  reportRoutesDatesFilter()
  getReports()



  const archive = document.querySelector('.table__archive')
  archive.addEventListener('click', e => {
    window.location.href = `${appAddr}/main/table`
  })
}
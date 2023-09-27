import "../../css/table/table.scss"
import {getReports} from "./getReports"
import {reportRoutesDatesFilter} from "./reportRoutesDatesFilter"
import {topReportFilter} from "./filters/topReportFilter"

export const user = JSON.parse(sessionStorage.getItem("user"))


if (window.location.href.endsWith('main/report')) {
  topReportFilter()
  reportRoutesDatesFilter()
  getReports()
}
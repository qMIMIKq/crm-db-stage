import "../../css/table/table.scss"
import {getReports} from "./getReports"
import {reportRoutesDatesFilter} from "./filters/reportRoutesDatesFilter"
import {topReportFilter} from "./filters/topReportFilter"
import {adminHandler} from "../modules/admin/adminHandler";
import {timeSortingFilter} from "./filters/reportFilters";

export const user = JSON.parse(localStorage.getItem("user"))
if (!user) {
  window.location.href = '/login'
}

if (window.location.href.endsWith('main/report')) {
  adminHandler()
  topReportFilter()
  reportRoutesDatesFilter()
  getReports()
  timeSortingFilter()
}
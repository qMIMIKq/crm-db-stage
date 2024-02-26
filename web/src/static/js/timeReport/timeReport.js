import "../../css/table/table.scss"
import {getTimeReports} from "./getTimeReports"
import {adminHandler} from "../modules/admin/adminHandler";
import {topReportFilter} from "../report/filters/topReportFilter";

export const user = JSON.parse(localStorage.getItem("user"))
if (!user) {
  window.location.href = '/login'
}

if (window.location.href.endsWith('main/time-report')) {
  console.log('hello')
  topReportFilter()
  adminHandler()
  getTimeReports()
}
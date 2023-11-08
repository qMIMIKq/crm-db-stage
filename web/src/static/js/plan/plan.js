import "../../css/table/table.scss"
import {adminHandler} from "../modules/admin/adminHandler";
import {topFiltersHandler} from "../modules/filters/topFilters";
import {getPlans} from "./getPlans";
import {reportPlanningDatesFilter} from "./filters/newPlanCheck";
import {topPlansFilters} from "./filters/topPlansFilters";

export const user = JSON.parse(localStorage.getItem("user"))
if (!user) {
  window.location.href = '/login'
}

if (window.location.href.endsWith('main/plan')) {
  topPlansFilters()
  reportPlanningDatesFilter()
  getPlans(false)
  adminHandler()
}
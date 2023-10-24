import "../../css/table/table.scss"
import {adminHandler} from "../modules/admin/adminHandler";
import {topFiltersHandler} from "../modules/filters/topFilters";
import {getPlans} from "./getPlans";
import {reportPlanningDatesFilter} from "./newPlanCheck";
import {topPlansFilters} from "./topPlansFilters";

export const user = JSON.parse(sessionStorage.getItem("user"))

if (window.location.href.endsWith('main/plan')) {
  topPlansFilters()
  reportPlanningDatesFilter()
  getPlans(false)
  adminHandler()
}
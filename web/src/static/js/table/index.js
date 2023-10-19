import "../../css/table/table.scss"
import {getOrders} from "../modules/getOrders";
import {topFiltersHandler} from "../modules/filters/topFilters";
import {state} from "../modules/state";
import {tableRoutesFiltersHandler} from "../modules/filters/tableRoutesFilters";
import {adminHandler} from "../modules/admin/adminHandler";

export const user = JSON.parse(sessionStorage.getItem("user"))

if (window.location.href.endsWith('main/table')) {
  state['startTime'] = state['startTime'] ? state['startTime'] : new Date().toISOString().split('.')[0]
  // state['startTime'] = state['startTime'] ? state['startTime'] : getTime() + `:${new Date().getSeconds()}`

  adminHandler()
  tableRoutesFiltersHandler()
  topFiltersHandler()
  getOrders('get-all', false)

  const subBtn = document.querySelector(".header-button__add")
  if (!(state["adminCheck"] || state['manCheck'])) {
    subBtn.classList.add("hidden__input")
    // plotsFilters.classList.add("hidden__input")
  }

  const updateMainTableData = () => {
    setInterval(getOrders, 1000)
  }
// updateMainTableData()
}


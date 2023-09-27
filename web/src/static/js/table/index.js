import "../../css/table/table.scss"
import {getOrders} from "../modules/orders";
import {topFiltersHandler} from "../modules/filters/topFilters";
import {state} from "../modules/state";
import {tableRoutesFiltersHandler} from "../modules/filters/tableRoutesFilters";
import {adminHandler} from "../modules/admin/adminHandler";

export const user = JSON.parse(sessionStorage.getItem("user"))

adminHandler()
if (window.location.href.endsWith('main/table')) {
  topFiltersHandler()
  getOrders()

  const subBtn = document.querySelector(".header-button__add")
  if (!(state["adminCheck"] || state['manCheck'])) {
    subBtn.classList.add("hidden__input")
    // plotsFilters.classList.add("hidden__input")
  }

  tableRoutesFiltersHandler()

  const updateMainTableData = () => {
    setInterval(getOrders, 1000)
  }
// updateMainTableData()
}


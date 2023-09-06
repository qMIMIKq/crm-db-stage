import "../../css/table/table.scss"
import {getOrders} from "../modules/orders";
import {topFiltersHandler} from "../modules/filters/topFilters";
import {state} from "../modules/state";
import {tableRoutesFiltersHandler} from "../modules/filters/tableRoutesFilters";

export const user = JSON.parse(sessionStorage.getItem("user"))

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


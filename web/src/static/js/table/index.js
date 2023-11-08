import "../../css/table/table.scss"
import {getOrders} from "../modules/getOrders";
import {topFiltersHandler} from "../modules/filters/topFilters";
import {state} from "../modules/state";
import {tableRoutesFiltersHandler} from "../modules/filters/tableRoutesFilters";
import {adminHandler} from "../modules/admin/adminHandler";

export const user = JSON.parse(sessionStorage.getItem("user"))

let arr = []
console.log(arr[1])

if (arr[1]) {
  console.log('hello ')
} else if (!arr[1]) {
  console.log('hello 2')
}

if (window.location.href.endsWith('main/table')) {
  state['startTime'] = state['startTime'] || new Date().toISOString().split('.')[0]

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
    setInterval(() => {
      if (!state.isArchive) {
        getOrders('get-all', true)
      }
    }, 5000)
  }
  updateMainTableData()
}


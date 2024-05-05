import "../../css/table/table.scss"
import {getOrders} from "../modules/getOrders";
import {topFiltersHandler} from "../modules/filters/topFilters";
import {state, userInf} from "../modules/state";
import {tableRoutesFiltersHandler} from "../modules/filters/tableRoutesFilters";
import {adminHandler} from "../modules/admin/adminHandler";
import {getData} from "../modules/getData";
import {appAddr} from "../../../../../appAddr";

export const user = JSON.parse(localStorage.getItem("user"))
if (user === '0') {
  window.location.href = '/login'
}

if (window.location.href.endsWith('main/table')) {
  // let today = getTime()
  // console.log(today)

  state['startTime'] = state['startTime'] || new Date().toISOString().split('.')[0]
  // console.log(state['startTime'])

  adminHandler()
  tableRoutesFiltersHandler()
  topFiltersHandler()
  getData('users/get-managers')
    .then(res => {
      state['managers'] = res.data.map(user => user.nickname)
    }).then(() => getOrders('get-all', false))

  const subBtn = document.querySelector(".header-button__add")
  if (!(state["adminCheck"] || state['manCheck'])) {
    subBtn.classList.add("hidden__input")
    // plotsFilters.classList.add("hidden__input")
  }

  // let updateInterval = setInterval(() => {
  //   if (!state.isArchive) {
  //     getOrders('get-all', true)
  //   }
  // }, 6000)
  //
  // setInterval(() => {
  //   clearInterval(updateInterval)
  //   updateInterval = setInterval(() => {
  //     if (!state.isArchive) {
  //       getOrders('get-all', true)
  //     }
  //   }, 6000)
  // }, 100000)
}


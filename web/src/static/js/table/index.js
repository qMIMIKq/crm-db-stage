import "../../css/table/table.scss"
import {getOrders} from "../modules/orders";
import {searchModule} from "../modules/search";
import {topFiltersHandler} from "../modules/topFilters";
import {state} from "../modules/state";

export const user = JSON.parse(sessionStorage.getItem("user"))

topFiltersHandler()
getOrders()
searchModule()

const subBtn = document.querySelector(".header-button__add")
const plotsFilters = document.querySelector(".nav-filters__plots")
if (!(state["adminCheck"] || state['manCheck'])) {
    subBtn.classList.add("hidden__input")
    // plotsFilters.classList.add("hidden__input")
}

const archive = document.querySelector('.table__archive')
archive.addEventListener('click', e => {
    if (e.target.textContent === 'Архив') {
        getOrders('get-old')
        e.target.textContent = 'В работе'
    } else {
        getOrders()
        e.target.textContent = 'Архив'
    }
})

const updateMainTableData = () => {
    setInterval(getOrders, 1000)
}
// updateMainTableData()


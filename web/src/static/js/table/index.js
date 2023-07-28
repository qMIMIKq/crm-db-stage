import "../../css/table/table.scss"
import {getOrders} from "../modules/orders";
import {searchModule} from "../modules/search";
import {topFiltersHandler} from "../modules/filters/topFilters";
import {state} from "../modules/state";
import {tableRoutesFiltersHandler} from "../modules/filters/tableRoutesFilters";

export const user = JSON.parse(sessionStorage.getItem("user"))

topFiltersHandler()
getOrders()
searchModule()

const subBtn = document.querySelector(".header-button__add")
if (!(state["adminCheck"] || state['manCheck'])) {
    subBtn.classList.add("hidden__input")
    // plotsFilters.classList.add("hidden__input")
}

const archive = document.querySelector('.table__archive')
archive.addEventListener('click', e => {
    if (e.target.textContent === 'Архив') {
        document.querySelector('.main-header__title').textContent = 'Архив заказов'
        getOrders('get-old')
        e.target.textContent = 'В работе'
    } else {
        getOrders()
        e.target.textContent = 'Архив'
        document.querySelector('.main-header__title').textContent = 'Журнал заказов'
    }
})

tableRoutesFiltersHandler()

const updateMainTableData = () => {
    setInterval(getOrders, 1000)
}
// updateMainTableData()


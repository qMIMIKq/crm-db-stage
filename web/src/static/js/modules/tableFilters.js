import {deleteOrders, getOrders} from "./orders";
import {state} from "./domain";
import {drawOrders} from "./drawOrders";

const numbersFilter = document.querySelector("#numbers")
const clientsFilter = document.querySelector("#clients")
const materialsFilter = document.querySelector("#materials")

export const deleteTableFilters = () => {
    const filters = document.querySelectorAll(".table__filter--new")
    if (filters[0] !== null) {
        filters.forEach(filter => filter.remove())
    }
}
export const drawTableFilters = (numbers, clients, materials) => {
    numbers.forEach(num => {
        numbersFilter.insertAdjacentHTML('beforeend', `
            <option class="table__filter--new" value="${num}">${num}</option>
        `)
    })
    clients.forEach(client => {
        clientsFilter.insertAdjacentHTML('beforeend', `
            <option class="table__filter--new" value="${client}">${client}</option>
        `)
    })
    materials.forEach(material => {
        materialsFilter.insertAdjacentHTML('beforeend', `
            <option class="table__filter--new" value="${material}">${material}</option>
        `)
    })
}

export const bindTableFilters = () => {
    const tableFilters = document.querySelectorAll(".table__filter")
    const filterWrappers = document.querySelectorAll(".table__use label")
    const numsTableFilter = document.querySelector("#numbers")
    const clientsTableFilter = document.querySelector("#clients")
    const materialsTableFilter = document.querySelector("#materials")
    let allFilters = []
    let currentFilters = []

    filterWrappers.forEach(wrapper => {
        wrapper.addEventListener("click", e => {
            const select = wrapper.parentNode.querySelector("select")
            wrapper.classList.add("hidden__input")
            select.classList.remove("hidden__input")
        })
    })
    tableFilters.forEach(filter => {
        filter.addEventListener("blur", e => {
            showFilter(e)
        })
    })
    const showFilter = e => {
        const target = e.target
        state["filtered"] = true
        const label = target.parentNode.querySelector("label")
        target.classList.add("hidden__input")
        label.classList.remove("hidden__input")
    }
    numsTableFilter.addEventListener("change", e => {
        showFilter(e)
        filterOrders("number", e.target.value)
    })
    clientsTableFilter.addEventListener("change", e => {
        showFilter(e)
        filterOrders("client", e.target.value)
    })
    materialsTableFilter.addEventListener("change", e => {
        showFilter(e)
        filterOrders("material", e.target.value)
    })
    const filterOrders = (type, filter) => {
        if (filter === "все") {
            state["filtered"] = false
            getOrders()
            return
        }
        state["filteredOrders"] = state["orders"].filter(o => o[type] === filter)
        deleteOrders()
        state["filteredOrders"].forEach(order => {
            drawOrders(order, state["filteredOrders"])
        })
    }
}

export const controlFiltersReset = () => {
    if (state["filtered"]) {
        const nav = document.querySelector(".main-header__nav")
        const resetBtn = nav.querySelector(".header-button__reset")
        if (resetBtn === null) {
            nav.insertAdjacentHTML('beforeend', `
                <button class="main__button main-header__button header-button__reset" tabindex="-1">Сбросить фильтры</button>
            `)
        }
        nav.querySelector(".header-button__reset").addEventListener("click", e => {
            document.querySelector("#search__input").value = ""
            state["filtered"] = false
            getOrders()
        })
    } else {
        const resetBtn = document.querySelector(".header-button__reset")
        if (resetBtn !== null) {
            resetBtn.remove()
        }
    }
}
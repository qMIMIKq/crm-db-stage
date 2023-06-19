import {deleteOrders} from "./orders";
import {drawOrders} from "./drawOrders";
import {bindOrdersListeners} from "./bindListeners";
import {state} from "./state";

export const searchModule = () => {
    const searchBtn = document.querySelector(".search__button")
    searchBtn.addEventListener("click", e => {
        const target = document.querySelector("#search__target").value
        const text = document.querySelector("#search__input").value.toLowerCase()
        state["filtered"] = true

        // filtered = true
        const newData = state["orders"].filter(o => o[target].toLowerCase().includes(text))
        deleteOrders()
        newData.forEach(d => {
            drawOrders(d, newData)
            bindOrdersListeners()
        })
    })
}
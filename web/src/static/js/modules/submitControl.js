import {getOrders} from "./orders";
import {bindOrdersListeners} from "./bindListeners";
import {orderHTML, table} from "./drawOrders";
import {addTriggers} from "./addTriggers";
import {triggerFilesModal} from "./downloadFilesModal";
import {triggerRoutesModal} from "./routesModal";
import {triggerCommentsModal} from "./commentsModal";
import {submitData} from "./submitOrdersData";
import {state} from "./domain";

const submitButtonHTML = `
    <button class="main-header__button main__button header-button__submit">Отправить</button>
`
const cancelButtonHTML = `
    <button class="main-header__button main__button header-button__cancel">Отмена</button>
`

const addOrder = document.querySelector(".header-button__add")

export const drawSubmit = () => {
    state["newOrders"] = true
    if (state["newOrders"]) {
        const sub = document.querySelector(".header-button__submit")
        const cancel = document.querySelector(".header-button__cancel")
        if (cancel === null) {
            addOrder.insertAdjacentHTML(`afterend`, cancelButtonHTML)
            document.querySelector(".header-button__cancel").addEventListener("click", cancelChange)
        }
        if (sub === null) {
            addOrder.insertAdjacentHTML(`afterend`, submitButtonHTML)
            document.querySelector(".header-button__submit").addEventListener("click", submitData)
        }
    }
}


export const deleteSubmitBtn = () => {
    const btn = document.querySelector(".header-button__submit")
    if (btn !== null) {
        btn.remove()
    }
    state["newOrders"] = false
}

export const cancelChange = e => {
    state["newOrders"] = false
    finallyForOrders(true)
}

export const deleteCancelBtn = () => {
    document.querySelector(".header-button__cancel").remove()
}

export const showResult = status => {
    let sucTitle = document.querySelector(".success")
    let errTitle = document.querySelector(".error")
    if (status) {
        if (sucTitle === null && errTitle === null) {
            addOrder.insertAdjacentHTML(`afterend`, `
            <h3 class="success">Успешно</h3>
        `)
        }
    } else {
        if (errTitle === null) {
            if (sucTitle !== null) {
                sucTitle.remove()
            }
            addOrder.insertAdjacentHTML(`afterend`, `
                <h3 class="error">Неудачно</h3>
            `)
        }
    }
    sucTitle = document.querySelector(".success")
    errTitle = document.querySelector(".error")
    setTimeout(() => {
        if (sucTitle !== null) {
            sucTitle.remove()
        }
        if (errTitle !== null) {
            errTitle.remove()
        }
    }, 1500)
}

addOrder.addEventListener("click", e => {
    drawSubmit()
    table.insertAdjacentHTML("afterbegin", orderHTML)
    bindOrdersListeners()
    addTriggers(".table__files", triggerFilesModal)
    addTriggers(".table__route", triggerRoutesModal)
    addTriggers(".table__comment", triggerCommentsModal)
})

export const finallyForOrders = success => {
    deleteSubmitBtn()
    deleteCancelBtn()
    showResult(success)
    getOrders()
}
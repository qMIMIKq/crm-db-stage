import {appAddr, state} from "./state";
import {sendData} from "./sendData";
import {getOrders} from "./orders";
import {showModal} from "./showModal";

const confirmDeleteOrderModal = `
    <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
        <div class='modal_content modal_content--confirm' style='width: 350px'>
            <h2 class='confirm__title'></h2>
            <div class='confirm__section'>
                <button class='main__button confirm__button confirm__button--ok'>Да</button>
                <button class='main__button confirm__button confirm__button--cncl'>Нет</button>
            </div>
        </div>
   </div>
`

const confirmDeleteHandler = (e, operation, titleText) => {
    const modal = showModal(confirmDeleteOrderModal)
    const okBtn = modal.querySelector('.confirm__button--ok')
    const cnclBtn = modal.querySelector('.confirm__button--cncl')
    const title = modal.querySelector('.confirm__title')
    title.textContent = titleText

    okBtn.addEventListener('click', () => {
        operation()
        modal.click()
    })

    cnclBtn.addEventListener('click', ev => {
        modal.click()
    })
}

export const deleteOrdersHandler = (currentOrder, issued, routes, id, hidden = true) => {
    if (issued == 0 && state['adminCheck'] && !routes) {
        console.log('hi')
        if (hidden) {
            currentOrder.querySelector('.table__db').insertAdjacentHTML(`afterbegin`, `
                <input class="order__delete hidden__input table__data--ro" id='order__delete' type="button" value="X" readonly>
            `)
        } else {
            currentOrder.querySelector('.table__db').insertAdjacentHTML(`afterbegin`, `
                <input class="order__delete table__data--ro" id='order__delete' type="button" value="X" readonly>
            `)
        }

        document.querySelector('.order__delete').addEventListener('click', e => {
            confirmDeleteHandler(e, () => {
                sendData(`${appAddr}/api/orders/delete/${id}`, 'POST', null).then(() => {
                    getOrders()
                })
            }, `Подвтердить удаление заказа №${id}?`)
        })
    }
}
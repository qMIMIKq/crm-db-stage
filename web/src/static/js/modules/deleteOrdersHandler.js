import {state} from "./state";
import {sendData} from "./sendData";
import {getOrders} from "./getOrders";
import {showModal} from "./modals/showModal";
import {appAddr} from "../../../../../appAddr";

const confirmDeleteOrderModal = `
    <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
        <div class='modal_content modal_content--confirm' style='width: 350px'>
            <h2 class='confirm__title'></h2>
            <div class='confirm__section'>
                <button class='main__button route__btn confirm__button confirm__button--ok'>Да</button>
                <button class='main__button route__btn confirm__button confirm__button--cncl'>Нет</button>
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
  const checkBtn = currentOrder.querySelector('#order__delete')

  if (issued == 0 && state['adminCheck'] && !routes && !checkBtn) {
    // console.log('hi')
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
          document.querySelector(`#form-${id}`).remove()
          state.orders = state.orders.filter(order => String(order.id) !== String(id))
          getOrders('get-all', true)
        })
      }, `Подвтердить удаление заказа №${id}?`)
    })
  }
}
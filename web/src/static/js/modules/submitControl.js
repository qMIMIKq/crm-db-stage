import {getOrders} from './orders';
import {bindOrdersListeners} from './bindListeners';
import {orderHTML, table} from './drawOrders';
import {addTriggers} from './addTriggers';
import {triggerFilesModal} from './modals/downloadFilesModal';
import {triggerRoutesModal} from './modals/routesModal';
import {triggerCommentsModal} from './modals/commentsModal';
import {submitData} from './submitOrdersData';
import {state} from './state';
import {drawManagers} from "./drawManagers";
import {drawDeadlineP} from "./drawDeadlineP";

const submitButtonHTML = `
    <button class='main-header__button main__button--click header-button__submit'>Отправить</button>
`
const cancelButtonHTML = `
    <button class='main-header__button main__button--click header-button__cancel'>Отмена</button>
`

const addOrder = document.querySelector('.header-button__add')

export const drawSubmit = () => {
  state['newOrders'] = true
  if (state['newOrders']) {
    const sub = document.querySelector('.header-button__submit')
    const cancel = document.querySelector('.header-button__cancel')
    if (cancel === null) {
      addOrder.insertAdjacentHTML(`afterend`, cancelButtonHTML)
      document.querySelector('.header-button__cancel').addEventListener('click', cancelChange)
    }
    if (sub === null) {
      addOrder.insertAdjacentHTML(`afterend`, submitButtonHTML)
      document.querySelector('.header-button__submit').addEventListener('click', submitData)
    }
  }
}


export const deleteSubmitBtn = () => {
  const btn = document.querySelector('.header-button__submit')
  if (btn !== null) {
    btn.remove()
  }
  state['newOrders'] = false
}

export const cancelChange = e => {
  state['newOrders'] = false
  finallyForOrders(true)
}

export const deleteCancelBtn = () => {
  const btn = document.querySelector('.header-button__cancel')
  if (btn !== null) {
    btn.remove()
  }
  state['newOrders'] = false
}

export const showResult = status => {
  const nav = document.querySelector(".nav-control__total")
  if (status) {
    nav.textContent = 'Успешно'
  } else {
    nav.textContent = 'Неудачно'
  }

  // setTimeout(() => {
  //   if (sucTitle !== null) {
  //     sucTitle.remove()
  //   }
  //   if (errTitle !== null) {
  //     errTitle.remove()
  //   }
  // }, 500)
}

addOrder.addEventListener('click', e => {
  drawSubmit()
  table.insertAdjacentHTML('afterbegin', orderHTML)
  drawManagers('.table-m-select', state['managers'], 'adfasdfsdfsdada')
  drawDeadlineP('.table-p-select', state['deadlinesP'], 'adfasdfsdfsdada')
  bindOrdersListeners()
  addTriggers('.table__files', triggerFilesModal)
  addTriggers('.table__route', triggerRoutesModal)
  addTriggers('.table__comment', triggerCommentsModal)
})

export const finallyForOrders = success => {
  deleteSubmitBtn()
  deleteCancelBtn()
  showResult(success)
  getOrders('get-all')
}
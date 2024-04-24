import {getOrders} from './getOrders';
import {bindOrdersListeners} from './bindOrdersListeners';
import {orderHTML, table} from './drawe/drawOrders';
import {addTriggers} from './addTriggers';
import {triggerFilesModal} from './modals/downloadFilesModal';
import {triggerRoutesModal} from './modals/routesModal';
import {triggerCommentsModal} from './modals/commentsModal';
import {submitData} from './submitOrdersData';
import {state} from './state';
import {drawManagers} from "./drawe/drawManagers";
import {drawDeadlineP} from "./drawe/drawDeadlineP";
import {copyOrderHandler} from "./copyOrderHandler";

const submitButtonHTML = `
    <button class='main-header__button main__button--click header-button__submit'>=></button>
`
const cancelButtonHTML = `
    <button class='main-header__button main__button--click header-button__cancel'>X</button>
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
  document.querySelectorAll('.table-form--new').forEach(newOrder => newOrder.remove())
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
  // const nav = document.querySelector(".main-header__title")
  // if (status) {
  //   nav.textContent = 'Успешно'
  // } else {
  //   nav.textContent = 'Неудачно'
  // }

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
  const currElem = document.querySelector('.table-form--new')
  // (currElem)
  drawManagers(currElem, '.table-m-select', state['managers'], 'adfasdfsdfsdada')
  drawDeadlineP(currElem, '.table-p-select', state['deadlinesP'], 'adfasdfsdfsdada')
  addTriggers(currElem, '.table__files', triggerFilesModal)
  addTriggers(currElem, '.table__route', e => triggerRoutesModal(e))
  addTriggers(currElem, '.table__comment', triggerCommentsModal)
  addTriggers(currElem, ".order__copy", copyOrderHandler)
  bindOrdersListeners(currElem)
})

export const finallyForOrders = success => {
  deleteSubmitBtn()
  deleteCancelBtn()
  showResult(success)
  getOrders('get-all', true)
}
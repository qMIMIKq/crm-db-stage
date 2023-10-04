import {orderHTML, table} from "./drawOrders";
import {state} from "./state";
import {drawManagers} from "./drawManagers";
import {drawDeadlineP} from "./drawDeadlineP";
import {bindOrdersListeners} from "./bindListeners";
import {addTriggers} from "./addTriggers";
import {triggerFilesModal} from "./modals/downloadFilesModal";
import {triggerRoutesModal} from "./modals/routesModal";
import {triggerCommentsModal} from "./modals/commentsModal";
import {drawSubmit} from "./submitControl";

export const copyOrderHandler = e => {

  const parentForm = e.target.closest('form')
  const formData = new FormData(parentForm)
  const obj = {}

  formData.forEach((value, key) => {
    switch (key) {
      case 'number':
      case 'client':
      case 'material':
      case 'name':
        obj[key] = value
        break
    }
  })


  table.insertAdjacentHTML('afterbegin', orderHTML)
  drawSubmit()
  drawManagers('.table-m-select', state['managers'], 'adfasdfsdfsdada')
  drawDeadlineP('.table-p-select', state['deadlinesP'], 'adfasdfsdfsdada')
  bindOrdersListeners()
  addTriggers('.table__files', triggerFilesModal)
  addTriggers('.table__route', triggerRoutesModal)
  addTriggers('.table__comment', triggerCommentsModal)
  addTriggers(".order__copy", copyOrderHandler)

  const currElem = document.querySelector('.table-form--new')
  currElem.querySelector('#number').value = obj.number
  currElem.querySelector('input[name="client"]').value = obj.client
  currElem.querySelector('input[name="name"]').value = obj.name
  currElem.querySelector('input[name="material"]').value = obj.material
}
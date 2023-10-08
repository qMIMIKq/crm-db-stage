import {orderHTML, table} from "./drawOrders";
import {state, userInf} from "./state";
import {drawManagers} from "./drawManagers";
import {drawDeadlineP} from "./drawDeadlineP";
import {bindOrdersListeners} from "./bindListeners";
import {addTriggers} from "./addTriggers";
import {triggerFilesModal} from "./modals/downloadFilesModal";
import {triggerRoutesModal} from "./modals/routesModal";
import {triggerCommentsModal} from "./modals/commentsModal";
import {drawSubmit} from "./submitControl";
import {getTime} from "./getTime";

export const copyOrderHandler = e => {
  const parentForm = e.target.closest('form')
  const formData = new FormData(parentForm)
  const obj = {}

  formData.forEach((value, key) => {
    switch (key) {
      case 'number':
      case 'client':
      case 'material':
      case 'quantity':
      case 'issued':
      case 'm':
      case 'end_time':
        obj[key] = value
        break
    }

    const today = getTime()
    const userName = userInf.nickname
    console.log(userName)

    if (key.includes('route')) {
      if (value) {
        const data = JSON.parse(value)
        obj[key] = {
          'plot': data.plot,
          'route_position': data.route_position,
          'comments': [{
            'date': today,
            'value': `${userName} Выбрал этап ${data.plot}`
          }]
        }
      }
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
  currElem.querySelector('input[name="material"]').value = obj.material
  currElem.querySelector('input[name="quantity"]').value = obj.quantity
  currElem.querySelector('input[name="issued"]').value = obj.issued
  currElem.querySelector('input[name="end_time"]').value = obj.end_time
  currElem.querySelector('select[name="m"]').value = obj.m

  const routesWrapper = currElem.querySelector(".table-routes__wrapper")
  for (let key of Object.keys(obj)) {
    if (key.includes('route') && !key.includes('issued') && !key.includes('json')) {
      const dataInput = routesWrapper.querySelector(`input[name=route-${obj[key].route_position}]`)
      const infoParent = dataInput.parentNode
      const routeInfo = infoParent.querySelector(`input[value="-"]`)
      routeInfo.value = obj[key].plot
      dataInput.value = JSON.stringify(obj[key])
    }
  }
}
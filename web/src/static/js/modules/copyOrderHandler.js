import {orderHTML, table} from "./drawe/drawOrders";
import {state, userInf} from "./state";
import {drawManagers} from "./drawe/drawManagers";
import {drawDeadlineP} from "./drawe/drawDeadlineP";
import {bindOrdersListeners} from "./bindOrdersListeners";
import {addTriggers} from "./addTriggers";
import {triggerFilesModal} from "./modals/downloadFilesModal";
import {triggerRoutesModal} from "./modals/routesModal";
import {triggerCommentsModal} from "./modals/commentsModal";
import {drawSubmit} from "./submitControl";
import {getTime} from "./getTime";
import {submitData} from "./submitOrdersData";


// export const copyOrderHandler = parent => {
//   const formData = new FormData(parent)

export const copyOrderHandler = e => {
  const parentForm = e.target.closest('form')
  const formData = new FormData(parentForm)
  const obj = {}

  formData.forEach((value, key) => {
    switch (key) {
      case 'number':
      case 'client':
      case 'quantity':
      case 'issued':
      case 'm':
      case 'end_time':
        obj[key] = value
        break
    }

    const today = getTime().replaceAll('-', '.')
    const userName = userInf.nickname

    if (key.includes('route')) {
      if (value) {
        const data = JSON.parse(value)
        obj[key] = {
          'plot': data.plot,
          'route_position': data.route_position,
          'comments': [{
            'date': today,
            'value': `${userName} Выбрал этап ${data.plot}`
          }],
          'end_time': '',
          'start_time': '',
          'error_time': '',
          'error_msg': '',
        }
      }
    }
  })

  table.insertAdjacentHTML('afterbegin', orderHTML)

  const currElem = document.querySelector('.table-form--new')
  // currElem.querySelector('#number').value = obj.number
  // currElem.querySelector('input[name="client"]').value = obj.client
  // currElem.querySelector('input[name="quantity"]').value = obj.quantity
  // currElem.querySelector('input[name="issued"]').value = obj.issued
  // currElem.querySelector('input[name="end_time"]').value = obj.end_time
  // console.log(currElem.querySelector('select[name="m"]'))

  drawSubmit()
  // drawManagers(currElem, '.table-m-select', state['managers'], 'adfasdfsdfsdada')
  // drawDeadlineP(currElem, '.table-p-select', state['deadlinesP'], 'adfasdfsdfsdada')
  // // currElem.querySelector('select[name="m"]').value = obj.m
  //
  // bindOrdersListeners(currElem)
  // // reportShowCurrentLine()
  // addTriggers(currElem, '.table__files', triggerFilesModal)
  // addTriggers(currElem, '.table__route', e => triggerRoutesModal(e))
  // addTriggers(currElem, '.table__comment', triggerCommentsModal)
  // addTriggers(currElem, ".order__copy", copyOrderHandler)

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

  submitData()
}
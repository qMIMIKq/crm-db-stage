import {finallyForOrders, showResult} from './submitControl';
import {} from './state';
import {sendData} from './sendData';
import {appAddr} from "../../../../../appAddr";

const createRes = forms => {
  const res = []
  forms.forEach(form => {
    const formData = new FormData(form)
    const obj = {}

    obj['routes_json'] = {}
    formData.forEach((value, key) => {
      switch (key) {
        case 'files':
          obj[key] = value.split(', ')
          break
        case 'completed':
          obj[key] = value === "true";
          break
        case 'comments':
          obj[key] = value.split('.-.')
          break
        case 'end_time':
          obj[key] = value
          break
        case 'issued':
          obj[key] = String(value)
          break
        case 'routes_json':
          break
        default:
          obj[key] = value.trim()
      }

      if (key.includes('route') && !key.includes('issued') && !key.includes('json') && value !== '') {
        // console.log(JSON.parse(obj[key]))

        if (value !== '-') {
          obj['routes_json'][key] = JSON.parse(String(value))
        }
      }
    })

    // console.log(obj)
    res.push(obj)
    // console.log(res)
  })

  return res.reverse()
}

export function submitSingleOrder(id) {
  const form = document.querySelectorAll(`#${id}`)
  // console.log(form)

  let success
  sendData(`${appAddr}/api/orders/update`, 'PUT', JSON.stringify(createRes(form))).then(res => {
    if (res.ok) success = true
  }).finally(() => {
    showResult(success)
    form[0].classList.remove('table-form--upd')
    form[0].classList.add('table-form--old')
  })
}

export function submitData() {
  const forms = document.querySelectorAll('.table-form--new')
  const formsUpd = document.querySelectorAll('.table-form--upd')
  let success = false
  const resNew = createRes(forms)
  const resUpd = createRes(formsUpd)
  if (resNew.length) {
    sendData(`${appAddr}/api/orders/add`, 'POST', JSON.stringify(resNew)).then(res => {
      if (res.ok) success = true
    }).finally(() => {
      finallyForOrders(success)
    })
  }
  if (resUpd.length) {
    sendData(`${appAddr}/api/orders/update`, 'PUT', JSON.stringify(resUpd)).then(res => {
      if (res.ok) success = true
    }).finally(() => {
      finallyForOrders(success)
    })
  }
}

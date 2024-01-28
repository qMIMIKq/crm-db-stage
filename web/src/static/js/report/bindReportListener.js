import {submitData} from "../modules/submitOrdersData";
import {drawSubmit} from "../modules/submitControl";
import {state} from "../modules/state";

const changeElemHandler = e => {
  const parent = e.target.closest('.table-form--old')

  if (parent !== null) {
    parent.classList.remove('table-form--old')
    parent.classList.add('table-form--upd')
    submitData()
    // submitSingleOrder(parent.getAttribute('id'))
  } else {
    drawSubmit()
  }
}

let label, listener, action, cls

export const bindReportsListeners = (currentElem) => {
  document.querySelectorAll('.table__data').forEach(innerLabel => {
    label = innerLabel

    if (!innerLabel.classList.contains('click-chose') && !innerLabel.classList.contains('click-select')) {
      listener = 'focus'
      action = 'add'
      cls = 'table__data--chosen'
      console.log(listener,action)
      setChooseListeners(innerLabel, listener, action, cls)

      listener = 'blur'
      action = 'remove'
      cls = 'table__data--chosen'
      console.log(listener,action)
      setChooseListeners(innerLabel, listener, action, cls)

      listener = 'focus'
      action = 'show-current'
      cls = 'table__data--current'
      console.log(listener,action)
      setChooseListeners(innerLabel, listener, action, cls)

      listener = 'blur'
      action = 'remove'
      cls = 'table__data--current'
      console.log(listener,action)
      setChooseListeners(innerLabel, listener, action, cls)
    } else if (!innerLabel.classList.contains('click-select')) {
      listener = 'click'
      action = 'add'
      cls = 'table__data--chosen'
      setChooseListeners(innerLabel, 'click', 'add', cls)
    } else {
      listener = 'click'
      action = 'toggle'
      cls = 'table__data--chosen'
      setChooseListeners(innerLabel, 'click', 'toggle', cls)
    }
  })

  document.querySelectorAll('.table__data').forEach(label => {
    label.removeEventListener('change', changeElemHandler)
    label.addEventListener('change', changeElemHandler)
  })

  document.querySelectorAll('input').forEach(el => {
    el.tabIndex = -1
    el.autocomplete = 'off'
  })
  document.querySelectorAll('button').forEach(el => {
    el.tabIndex = -1
  })
  document.querySelectorAll('a').forEach(el => {
    el.tabIndex = -1
  })
  document.querySelectorAll('select').forEach(el => {
    el.tabIndex = -1
  })
}

const chooseHandler = e => {
  const parent = e.target.closest('.main-table__item')
  document.querySelectorAll('.table__data--chosen').forEach(chosen => {
    chosen.classList.remove('table__data--current')
    if (parent.querySelector('#db_id').classList.contains('table__data--opened')) {
      if (!chosen.classList.contains('tr')) {
        chosen.classList.remove(cls)
      }
    } else if (chosen.classList.contains('tr') && chosen.parentNode.parentNode.parentNode.parentNode.querySelector('#db_id').classList.contains('table__data--opened')) {
    } else {
      chosen.classList.remove(cls)
    }
  })

  parent.querySelectorAll('.table__data').forEach(item => {
    // console.log('bind listener to item!')

    // item.classList.remove('table__data--current')
    console.log(action)
    console.log(listener)
    switch (action) {
      case 'add':
        e.target.classList.add('table__data--current')
        if (!label.classList.contains('table__data--opened')) {
          state['inWork'] = true
          item.classList.add(cls)

          // item.classList.add('table__data--current')
          // if (item.parentElement.classList.contains('table__route')) {
          //   item.parentElement.classList.add('table__data--chosen')
          // }

          // if (parent.classList.contains('table__route')) {
          //   parent.classList.add('table__data--chosen')
          // }

          state['currentOrder'] = parent.querySelector('#db_id').value
        }
        break

      case 'show-current':
        state['inWork'] = true
        e.target.classList.add(cls)
        break

      case 'toggle':
        // item.classList.remove('table__data--current')
        state['inWork'] = true
        if (!e.target.classList.contains('table__data--opened')) {
          item.classList.remove('table__data--chosen')
        } else {
          item.classList.add(cls)
        }
        break

      default:
        item.classList.remove('table__data--current')
        if (cls === 'table__data--current') {
          state['inWork'] = false
          item.classList.remove(cls)
          return
        }
        if (!label.classList.contains('table__data--opened')) {
          state['inWork'] = false
          item.classList.remove(cls)
        }
    }
  })
}


const setChooseListeners = (innerLabel, innerListener) => {
  if (!innerLabel.classList.contains('table__data--clicker')) {
    innerLabel.removeEventListener(innerListener, chooseHandler)
    innerLabel.addEventListener(innerListener, chooseHandler)
  }
}
import {drawSubmit} from './submitControl';
import {state} from './state';
import {submitData} from "./submitOrdersData";

export const bindOrdersListeners = () => {
  document.querySelectorAll('.table__data').forEach(label => {
    if (!label.classList.contains('click-chose') && !label.classList.contains('click-select')) {
      setChooseListeners(label, 'focus', 'add', 'table__data--chosen')
      setChooseListeners(label, 'blur', 'remove', 'table__data--chosen')
      setChooseListeners(label, 'focus', 'show-current', 'table__data--current')
      setChooseListeners(label, 'blur', 'remove', 'table__data--current')
    } else if (!label.classList.contains('click-select')) {
      setChooseListeners(label, 'click', 'add', 'table__data--chosen')
    } else {
      setChooseListeners(label, 'click', 'toggle', 'table__data--chosen')
    }
  })
  document.querySelectorAll('.table__data').forEach(label => {
    label.addEventListener('change', e => {
      const parent = e.target.closest('.table-form--old')

      if (parent !== null) {
        parent.classList.remove('table-form--old')
        parent.classList.add('table-form--upd')
        submitData()
        // submitSingleOrder(parent.getAttribute('id'))
      } else {
        drawSubmit()
      }
    })
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

const setChooseListeners = (label, listener, action, cls) => {
  if (!label.classList.contains('table__data--clicker')) {
    label.addEventListener(listener, e => {
      const parent = e.target.closest('.main-table__item')
      document.querySelectorAll('.table__data--chosen').forEach(chosen => {
        if (parent.querySelector('#db_id').classList.contains('table__data--opened')) {
          if (!chosen.classList.contains('tr')) {
            chosen.classList.remove(cls)
          }
        } else if (chosen.classList.contains('tr') && chosen.parentNode.parentNode.parentNode.parentNode.querySelector('#db_id').classList.contains('table__data--opened')) {
          console.log(chosen)
        } else {
          chosen.classList.remove(cls)
        }
      })

      parent.querySelectorAll('.table__data').forEach(item => {
        switch (action) {
          case 'add':
            if (!label.classList.contains('table__data--opened')) {
              state['inWork'] = true
              item.classList.add(cls)
              state['currentOrder'] = parent.querySelector('#db_id').value
            }
            break

          case 'show-current':
            state['inWork'] = true
            e.target.classList.add(cls)
            break

          case 'toggle':
            state['inWork'] = true
            if (!e.target.classList.contains('table__data--opened')) {
              item.classList.remove('table__data--chosen')
            } else {
              item.classList.add(cls)
            }
            break

          default:
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
    })
  }
}

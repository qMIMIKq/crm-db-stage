import {submitData} from "./submitOrdersData";
import {drawSubmit} from "./submitControl";
import {state} from './state';

// const changeElemHandler = e => {
//   const parent = e.target.closest('.table-form--old')
//
//   if (parent !== null) {
//     parent.classList.remove('table-form--old')
//     parent.classList.add('table-form--upd')
//     submitData()
//     // submitSingleOrder(parent.getAttribute('id'))
//   } else {
//     drawSubmit()
//   }
// }
//
// export const bindOrdersListeners = () => {
//   const mainTable = document.querySelector('.main__table')
//   const forms = mainTable.querySelectorAll('form')
//
//   forms.forEach(form => {
//     form.addEventListener('click', e => {
//       forms.forEach(outterForm => {
//         outterForm.classList.remove('table__data--chosen')
//         try {
//           outterForm.querySelector('.table__data--current').removeEventListener('change', changeElemHandler)
//           outterForm.querySelector('.table__data--current').classList.remove('table__data--current')
//           outterForm.querySelector('.table-routes__wrapper').classList.remove('table__data--chosen')
//           outterForm.querySelector('.table__p').classList.remove('table__data--chosen')
//           outterForm.querySelector('.table__comment').classList.remove('table__data--chosen')
//         } catch {
//         }
//       })
//
//       const target = e.target
//       target.classList.add('table__data--current')
//       target.addEventListener('change', changeElemHandler)
//
//       form.classList.add('table__data--chosen')
//       form.querySelector('.table-routes__wrapper').classList.add('table__data--chosen')
//       form.querySelector('.table__p').classList.add('table__data--chosen')
//       form.querySelector('.table__comment').classList.add('table__data--chosen')
//     })
//   })
// }

// const changeElemHandler = e => {
//   const parent = e.target.closest('.table-form--old')
//
//   if (parent !== null) {
//     parent.classList.remove('table-form--old')
//     parent.classList.add('table-form--upd')
//     submitData()
//     // submitSingleOrder(parent.getAttribute('id'))
//   } else {
//     drawSubmit()
//   }
// }
//


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

export const bindOrdersListeners = (currentElem) => {
  document.querySelectorAll('.table__data').forEach(innerLabel => {
    label = innerLabel

    if (!innerLabel.classList.contains('click-chose') && !innerLabel.classList.contains('click-select')) {
      listener = 'focus'
      action = 'add'
      cls = 'table__data--chosen'
      setChooseListeners(innerLabel, 'focus', 'add', 'table__data--chosen')

      listener = 'blur'
      action = 'remove'
      cls = 'table__data--chosen'
      setChooseListeners(innerLabel, 'blur', 'remove', 'table__data--chosen')

      listener = 'focus'
      action = 'show-current'
      cls = 'table__data--current'
      setChooseListeners(innerLabel, 'focus', 'show-current', 'table__data--current')

      listener = 'blur'
      action = 'remove'
      cls = 'table__data--current'
      setChooseListeners(innerLabel, 'blur', 'remove', 'table__data--current')
    } else if (!innerLabel.classList.contains('click-select')) {
      listener = 'click'
      action = 'add'
      cls = 'table__data--chosen'
      setChooseListeners(innerLabel, 'click', 'add', 'table__data--chosen')
    } else {
      listener = 'click'
      action = 'toggle'
      cls = 'table__data--chosen'
      setChooseListeners(innerLabel, 'click', 'toggle', 'table__data--chosen')
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
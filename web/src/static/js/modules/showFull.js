import {state} from "./state";
import {copyOrderHandler} from "./copyOrderHandler";

export const showRoutesIssued = e => {
  const parent = e.target.parentNode.parentNode.parentNode
  parent.classList.toggle('opened-order')
  // console.log(parent)

  // if (state.adminCheck || state.manCheck) {
  //   let insertPlace = document.querySelector('.main-header__nav')
  //   let copyBtn = document.querySelector('.header-button__copy')
  //   let deleteBtn = document.querySelector('.header-button__delete')
  //
  //   if (parent.classList.contains('opened-order')) {
  //     console.log('opened')
  //   } else {
  //     console.log('doesnt opened')
  //   }
  //
  //   if (!copyBtn) {
  //     insertPlace.insertAdjacentHTML('beforeend', `
  //       <button class='main-header__button main__button--click header-button__copy'>Дубль</button>
  //     `)
  //
  //     insertPlace.insertAdjacentHTML('beforeend', `
  //       <button class='main-header__button main__button--click header-button__delete'>Удалить</button>
  //     `)
  //
  //     copyBtn = document.querySelector('.header-button__copy')
  //     copyBtn.addEventListener('click', () => copyOrderHandler(parent))
  //
  //     deleteBtn = document.querySelector('.header-button__delete')
  //   } else {
  //     copyBtn.remove()
  //     deleteBtn.remove()
  //   }
  // }


  parent.querySelectorAll('.table__data').forEach(label => {
    const id = parent.querySelector('#db_id').value

    if (!label.classList.contains('tr')) {
      if (!label.classList.contains('table__data--opened')) {
        label.classList.add('table__data--opened')
        state['openedOrders'].push(id)
        state['openedOrders'] = [...new Set(state['openedOrders'])]
      } else {
        label.classList.remove('table__data--opened')
        state['openedOrders'] = state['openedOrders'].filter(opId => opId !== id)
      }
    }
  })

  const scrollRoutesBtns = parent.querySelectorAll('.routes-btn')
  scrollRoutesBtns.forEach(btn => {
    btn.classList.toggle('routes-btn--opened')
  })

  const addRouteBtn = parent.querySelector('.table-routes__add ')
  addRouteBtn.classList.toggle('table-routes__add--opened')

  const issued = parent.querySelector('.table-routes__issued')
  if (issued) {
    issued.classList.toggle('hidden__input')
  }


  // const complete = parent.querySelector('.table__complete')
  // // console.log(complete)
  // if (complete) {
  //   complete.classList.toggle('hidden__input')
  // }
  //
  // const delBtn = parent.querySelector('.order__delete')
  // if (delBtn) {
  //   delBtn.classList.toggle('hidden__input')
  //   delBtn.addEventListener('click', e => {
  //     // console.log(e.target.parentNode.querySelector('#db_id').value)
  //   })
  // }
}
import {state} from "./state";

export const showRoutesIssued = e => {
  const parent = e.target.parentNode.parentNode

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

  const issued = parent.querySelector('.table-routes__issued')
  if (issued) {
    issued.classList.toggle('hidden__input')
  }

  const complete = parent.querySelector('.table__complete')
  console.log(complete)
  if (complete) {
    complete.classList.toggle('hidden__input')
  }

  const delBtn = parent.querySelector('.order__delete')
  if (delBtn) {
    delBtn.classList.toggle('hidden__input')
    delBtn.addEventListener('click', e => {
      console.log(e.target.parentNode.querySelector('#db_id').value)
    })
  }
}
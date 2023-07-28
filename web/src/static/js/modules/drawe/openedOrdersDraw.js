import {state} from "../state";
import {deleteOrdersHandler} from "../deleteOrdersHandler";

export const openedOrdersDraw = (currentOrder, d, routes) => {
  if (state['openedOrders'].includes(String(d.id))) {
    currentOrder.querySelectorAll('.table__data').forEach(item => {
      if (!item.classList.contains('tr')) {
        if (!item.classList.contains('table__data--opened')) {
          item.classList.add('table__data--opened')
        }
      } else {
        item.classList.add('table__data--chosen')
      }
    })

    deleteOrdersHandler(currentOrder, d.issued, routes, d.id, false)

    try {
      currentOrder.querySelector('.table-routes__issued').classList.remove('hidden__input')
      const complete = currentOrder.querySelector('.table__complete')
      complete.classList.remove('hidden__input')
      complete.querySelector('.tr').classList.add('table-data__chosen')
    } catch {
    }
  }

  if (String(d.id) === state['currentOrder']) {
    currentOrder.querySelectorAll('.table__data').forEach(item => {
      if (!item.classList.contains('table__data--opened')) {
        item.classList.add('table__data--chosen')
      }
    })
  }
}
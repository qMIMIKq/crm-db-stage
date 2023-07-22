import {state} from "./state";
import {drawOrders} from "./drawOrders";

export const globalFilterOrders = (order, topFilters) => {
  let flag = true
  for (let type in state['tableFilters']) {
    const filter = state['tableFilters'][type]
    if (filter === 'все') {
    } else if (filter) {
      if (!(order[type].trim() === state['tableFilters'][type].trim())) {
        flag = false
        break
      }
    }
  }

  if (flag) {
    drawOrders(order, state['filteredOrders'], state['managers'])
  }

  return flag
}
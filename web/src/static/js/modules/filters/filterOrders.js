import {state} from "../state";
import {drawOrders} from "../drawOrders";

export const globalFilterOrders = (order, topFilters) => {
  let flag = true
  for (let type in state['tableFilters']) {
    const filter = state['tableFilters'][type]

    if (filter === 'все') {
    } else if (filter === 'Не заполнено') {
      if (order[type]) {
        flag = false
        break
      }
    } else if (filter) {
      if (type === 'end_time') {
        if (!(order[type] && order[type].split('T')[0] === state['tableFilters'][type])) {
          console.log('??')
          flag = false
          break
        }
      } else if (type === 'timestamp') {
        const deadline = order[type].split('T')[0]
        if (!(deadline === state['tableFilters'][type])) {
          flag = false
          break
        }

      } else if (!(order[type].trim() === state['tableFilters'][type].trim())) {
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
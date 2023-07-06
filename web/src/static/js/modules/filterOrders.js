import {state} from "./state";
import {drawOrders} from "./drawOrders";

export const globalFilterOrders = (order) => {
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
        // state['filteredOrders'].push(order)
        drawOrders(order, state['filteredOrders'], state['managers'])
    }
}
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

    try {
        parent.querySelector('.table-routes__issued').classList.toggle('hidden__input')
        parent.querySelector('.table__complete').classList.toggle('hidden__input')
    } catch {
    }
}
import {
    bindTableFilters,
    clientsFilter,
    deadlineFilter,
    deleteTableFilters,
    drawTableFilter,
    issuedFilter,
    managerFilter,
    materialsFilter,
    namesFilter,
    numsFilter,
    quantityFilter,
    timestampFilter
} from './tableFilters';
import {appAddr, state} from './state';
import {bindOrdersListeners} from './bindListeners';
import {getData} from './getData';
import {globalFilterOrders} from "./filterOrders";
import {drawOrders} from "./drawOrders";

let searchedOrders = []

export const getOrders = () => {
    console.log('get orders')
    fetch(`${appAddr}/api/orders/get-all`).then(res => res.json()).then(data => {
        console.log('orders HERE')
        const nums = []
        const clients = []
        const materials = []
        const names = []
        const quantity = []
        const issued = []
        const managers = []
        const deadlines = []
        const timestamps = []

        deleteTableFilters()
        deleteOrders()

        getData('users/get-users')
            .then(res => {
                data.data.forEach(d => {
                    state['orders'] = data.data
                    state['filteredOrders'] = state['orders'].filter(o => o)
                    searchedOrders = state['orders'].filter(o => o)

                    nums.push(d.number)
                    clients.push(d.client)
                    materials.push(d.material)
                    names.push(d.name)
                    quantity.push(d.quantity)
                    issued.push(d.issued)
                    managers.push(d.m)
                    deadlines.push(d.end_time)
                    timestamps.push(d.timestamp.split('T')[0])

                    if (!state['filtered']) {
                        state['managers'] = res.data.filter(user => user.group === 'менеджер')
                    }

                    if (state['filtered']) {
                        globalFilterOrders(d)
                    } else {
                        drawOrders(d, data, state['managers'])
                    }
                })

                drawTableFilter([...new Set(nums)], numsFilter)
                drawTableFilter([...new Set(clients)], clientsFilter)
                drawTableFilter([...new Set(materials)], materialsFilter)
                drawTableFilter([...new Set(names)], namesFilter)
                drawTableFilter([...new Set(quantity)], quantityFilter)
                drawTableFilter([...new Set(issued)], issuedFilter)
                drawTableFilter([...new Set(managers)], managerFilter)
                drawTableFilter([...new Set(deadlines)], deadlineFilter)
                drawTableFilter([...new Set(timestamps)], timestampFilter)

                const totalOrders = document.querySelector('.orders__total')
                if (totalOrders === null) {
                    document.querySelector('.main').insertAdjacentHTML('beforeend', `
                     <h3 class='orders__total'>Всего в работе ${data.data.length}</h3>
                    `)
                } else {
                    totalOrders.textContent = `Всего в работе ${data.data.length}`
                }
                bindOrdersListeners()
                bindTableFilters()
                console.log('drawed orders')
            })
    })
}

export const deleteOrders = () => {
    const orders = document.querySelectorAll('.table-form')
    // document.querySelector('.orders__total').remove()

    orders.forEach(order => {
        order.remove()
    })
}

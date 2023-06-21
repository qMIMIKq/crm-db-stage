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
import {drawOrders} from './drawOrders';
import {appAddr, state} from './state';
import {bindOrdersListeners} from './bindListeners';
import {getData} from './getData';

let searchedOrders = []
let updatedOrders = []

export const getOrders = () => {
    // if (state['inWork']) return
    fetch(`${appAddr}/api/orders/get-all`).then(res => res.json()).then(data => {
        state['filtered'] = false
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
                    drawOrders(d, data, state['managers'])
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

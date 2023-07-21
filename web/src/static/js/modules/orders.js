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
import {filterData} from "./topFilters";
import {errFilter, startFilter} from "./tableRoutesFilters";

export const getOrders = (postfix = 'get-all') => {
    state['isArchive'] = postfix !== 'get-all'

    document.querySelector('.table-info').insertAdjacentHTML('beforeend', `
        <h3 class="warning">Обновляем таблицу...</h3>
    `)
    document.querySelector('.table__archive').classList.add('hidden__input')

    const filters = state['currentTopFilters'].map(filter => filter.name)
    console.time('get orders')
    fetch(`${appAddr}/api/orders/${postfix}`).then(res => res.json()).then(data => {
        const nums = []
        const clients = []
        const materials = []
        const names = []
        const quantity = []
        const issued = []
        const managers = []
        const deadlines = []
        const timestamps = []

        getData('users/get-users')
            .then(res => {
                deleteTableFilters()
                deleteOrders()

                data.data.forEach(d => {
                    state['orders'] = data.data
                    state['filteredOrders'] = state['orders'].filter(o => o)

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

                    if (state['filtered'] && filters.length) {
                        // console.log('big filter')
                        globalFilterOrders(d, filters)
                        filterData()
                    } else if (state['filtered']) {
                        console.log('table filter')
                        globalFilterOrders(d)
                    } else if (filters.length) {
                        // console.log('top filter')
                        filterData()
                    } else {
                        // console.log('draw only')
                        drawOrders(d, data, state['managers'])
                    }

                    if (!filters.length) {
                        if (state['routesFilters'].started) {
                            deleteOrders()
                            startFilter(filters)
                        } else if (state['routesFilters'].error) {
                            deleteOrders()
                            errFilter(filters)
                        }
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

                document.querySelector('.table-info').querySelector('.warning').remove()
                const totalOrders = document.querySelector('.orders__total')
                if (totalOrders === null) {
                    document.querySelector('.table-info').insertAdjacentHTML('afterbegin', `
                        <h3 class='orders__total'>Всего в работе ${data.data.length}</h3>
                    `)
                } else {
                    totalOrders.textContent = `Всего в работе ${data.data.length}`
                }
                document.querySelector('.table__archive').classList.remove('hidden__input')

                bindOrdersListeners()
                bindTableFilters()

                if (state['isArchive']) {
                    document.querySelectorAll('.table__data').forEach(field => {
                        field.setAttribute("readonly", "true")
                    })
                }

                console.timeEnd('get orders')

                document.querySelectorAll(".table-form").forEach(form => {
                    form.addEventListener('click', e => {
                        console.log("I am form hi)")
                    })
                })
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

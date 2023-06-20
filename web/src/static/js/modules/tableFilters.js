import {deleteOrders, getOrders} from './orders';
import {state} from './state';
import {drawOrders} from './drawOrders';


export const tableFiltersWrapper = document.querySelector('.main-table__header')
export const numsFilter = tableFiltersWrapper.querySelector('#numbers')
export const clientsFilter = tableFiltersWrapper.querySelector('#clients')
export const materialsFilter = tableFiltersWrapper.querySelector('#materials')
export const namesFilter = tableFiltersWrapper.querySelector("#name")
export const quantityFilter = tableFiltersWrapper.querySelector("#quantity")
export const issuedFilter = tableFiltersWrapper.querySelector("#issued")
export const managerFilter = tableFiltersWrapper.querySelector("#m")
export const deadlineFilter = tableFiltersWrapper.querySelector("#end_time")

export const deleteTableFilters = () => {
    const filters = document.querySelectorAll('.table__filter--new')
    if (filters[0] !== null) {
        filters.forEach(filter => filter.remove())
    }
}
// export const drawTableFilters =
//     (numbers, clients, materials, n) => {
//         numbers.forEach(num => {
//             numsFilter.insertAdjacentHTML('beforeend', `
//             <option class='table__filter--new' value='${num}'>${num}</option>
//         `)
//         })
//         clients.forEach(client => {
//             clientsFilter.insertAdjacentHTML('beforeend', `
//             <option class='table__filter--new' value='${client}'>${client}</option>
//         `)
//         })
//         materials.forEach(material => {
//             materialsFilter.insertAdjacentHTML('beforeend', `
//             <option class='table__filter--new' value='${material}'>${material}</option>
//         `)
//         })
//
//     }

export const drawTableFilter = (data, target) => {
    data.forEach(d => {
        target.insertAdjacentHTML('beforeend', `
            <option class='table__filter--new' value='${d}'>${d}</option>
        `)
    })
}

export const bindTableFilters = () => {
    const tableFilters = document.querySelectorAll('.table__filter')
    const filterWrappers = document.querySelectorAll('.table__use label')
    let allFilters = []
    let currentFilters = []

    filterWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', e => {
            const select = wrapper.parentNode.querySelector('select')
            wrapper.classList.add('hidden__input')
            select.classList.remove('hidden__input')
        })
    })
    tableFilters.forEach(filter => {
        filter.addEventListener('blur', e => {
            showFilter(e)
        })
    })

    bindFilter(numsFilter, 'number')
    bindFilter(clientsFilter, 'client')
    bindFilter(materialsFilter, 'material')
    bindFilter(namesFilter, 'name')
    bindFilter(quantityFilter, 'quantity')
    bindFilter(issuedFilter, 'issued')
    bindFilter(managerFilter, 'm')
    bindFilter(deadlineFilter, 'end_time')
}

const showFilter = e => {
    const target = e.target
    state['filtered'] = true
    const label = target.parentNode.querySelector('label')
    target.classList.add('hidden__input')
    label.classList.remove('hidden__input')
}

const filterOrders = (type, filter) => {
    if (filter === 'все') {
        state['filtered'] = false
        tableFiltersWrapper.querySelectorAll(".table__cell label").forEach(cell => {
            cell.style.textDecoration = 'none'
        })

        getOrders()
        return
    }

    state['filteredOrders'] = state['filteredOrders'].filter(o => o[type] === filter)
    deleteOrders()
    state['filteredOrders'].forEach(order => {
        drawOrders(order, state['filteredOrders'], state['managers'])
    })
}


const bindFilter = (elem, type) => {
    elem.removeEventListener('change', filterListener)
    elem.addEventListener('change', filterListener)
}

const filterListener = (e) => {
    showFilter(e)
    filterOrders(e.target.parentNode.querySelector(".filter__type").value, e.target.value)
    setChosenFilter(e)
}

export const controlFiltersReset = () => {
    if (state['filtered']) {
        const nav = document.querySelector('.main-header__nav')
        const resetBtn = nav.querySelector('.header-button__reset')
        if (resetBtn === null) {
            nav.insertAdjacentHTML('beforeend', `
                <button class='main__button main-header__button header-button__reset' tabindex='-1'>Сбросить фильтры</button>
            `)

            nav.querySelector('.header-button__reset').addEventListener('click', e => {
                document.querySelector('#search__input').value = ''
                state['filtered'] = false
                tableFiltersWrapper.querySelectorAll(".table__cell label").forEach(cell => {
                    cell.style.textDecoration = 'none'
                })
                getOrders()
            })
        }
    } else {
        const resetBtn = document.querySelector('.header-button__reset')
        if (resetBtn !== null) {
            resetBtn.remove()
        }
    }
}

const setChosenFilter = e => {
    if (state['filtered']) {
        e.target.parentNode.querySelector('label').style.textDecoration = 'underline'
    } else {
        e.target.parentNode.querySelector('label').style.textDecoration = 'none'
    }
}
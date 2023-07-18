import {state} from "./state";
import {globalFilterOrders} from "./filterOrders";
import {filterData} from "./topFilters";
import {drawOrders} from "./drawOrders";
import {deleteOrders, getOrders} from "./orders";
import {bindOrdersListeners} from "./bindListeners";

export const startFilter = (filters) => {
    state['orders'].forEach(order => {
        let check = false

        if (order.db_routes) {
            order.db_routes.forEach(route => {
                if (route.start_time) {
                    if (filters.length) {
                        if (filters.includes(route.plot)) {
                            check = true
                        }
                    } else {
                        check = true
                    }
                }
            })
        }

        if (check) {
            console.log(order)
            if (state['filtered'] && filters.length) {
                globalFilterOrders(order)
                filterData()
            } else if (state['filtered']) {
                globalFilterOrders(order)
            } else {
                drawOrders(order, state['filteredOrders'], state['managers'])
            }
        }

        return check
    })

    bindOrdersListeners()
}

export const errFilter = (filters) => {
    state['orders'].forEach(order => {
        let check = false

        if (order.db_routes) {
            order.db_routes.forEach(route => {
                if (route.error_msg) {
                    if (filters.length) {
                        if (filters.includes(route.plot)) {
                            check = true
                        }
                    } else {
                        check = true
                    }

                }
            })
        }

        if (check) {
            if (state['filtered'] && filters.length) {
                globalFilterOrders(order)
                filterData()
            } else if (state['filtered']) {
                console.log('table filters')
                globalFilterOrders(order)
            } else {
                drawOrders(order, state['filteredOrders'], state['managers'])
            }
        }

    })

    bindOrdersListeners()
}

export const uncompletedFilter = (filters) => {
    state['orders'].forEach(order => {
        let check = false

        if (order.db_routes) {
            order.db_routes.forEach(route => {
                if (route.issued && route.quantity) {
                    if (route.issued >= route.quantity) {

                    } else {
                        if (filters.length) {
                            if (filters.includes(route.plot)) {
                                check = true
                            }
                        } else {
                            check = true
                        }
                    }
                } else {
                    if (filters.length) {
                        if (filters.includes(route.plot)) {
                            check = true
                        }
                    } else {
                        check = true
                    }
                }
            })
        }

        if (check) {
            if (state['filtered'] && filters.length) {
                globalFilterOrders(order)
                filterData()
            } else if (state['filtered']) {
                console.log('table filters')
                globalFilterOrders(order)
            } else {
                drawOrders(order, state['filteredOrders'], state['managers'])
            }
        }

    })

    bindOrdersListeners()
}

export const tableRoutesFiltersHandler = () => {
    const inWorkBtn = document.querySelector(".header-routes__work")
    const inErrorBtn = document.querySelector(".header-routes__error")
    const uncompletedBtn = document.querySelector(".header-routes__uncompleted")

    inWorkBtn.addEventListener('click', e => {
        if (inWorkBtn.classList.contains('route__filter--chosen')) {
            inWorkBtn.classList.remove('route__filter--chosen')
            state['routesFilters'].started = false
            getOrders()
            return
        }

        inErrorBtn.classList.remove('route__filter--chosen')
        uncompletedBtn.classList.remove('route__filter--chosen')
        inWorkBtn.classList.add('route__filter--chosen')

        state['routesFilters'].started = true
        state['routesFilters'].error = false
        state['routesFilters'].uncompleted = false

        deleteOrders()
        const filters = state['currentTopFilters'].map(filter => filter.name)
        startFilter(filters)
    })

    inErrorBtn.addEventListener('click', e => {
        if (inErrorBtn.classList.contains('route__filter--chosen')) {
            inErrorBtn.classList.remove('route__filter--chosen')
            state['routesFilters'].error = false
            getOrders()
            return
        }

        state['routesFilters'].error = true
        state['routesFilters'].started = false
        state['routesFilters'].uncompleted = false

        inWorkBtn.classList.remove('route__filter--chosen')
        uncompletedBtn.classList.remove('route__filter--chosen')
        inErrorBtn.classList.add('route__filter--chosen')

        deleteOrders()
        const filters = state['currentTopFilters'].map(filter => filter.name)
        errFilter(filters)
    })

    uncompletedBtn.addEventListener('click', e => {
        if (uncompletedBtn.classList.contains('route__filter--chosen')) {
            uncompletedBtn.classList.remove('route__filter--chosen')
            state['routesFilters'].error = false
            getOrders()
            return
        }

        inErrorBtn.classList.remove('route__filter--chosen')
        inWorkBtn.classList.remove('route__filter--chosen')
        uncompletedBtn.classList.add('route__filter--chosen')

        state['routesFilters'].uncompleted = true
        state['routesFilters'].started = false
        state['routesFilters'].error = false

        deleteOrders()
        const filters = state['currentTopFilters'].map(filter => filter.name)
        uncompletedFilter(filters)
    })
}


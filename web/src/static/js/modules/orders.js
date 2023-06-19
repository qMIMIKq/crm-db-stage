import {
    bindTableFilters,
    clientsFilter,
    deadlineFilter,
    deleteTableFilters,
    drawTableFilter,
    issuedFilter,
    materialsFilter,
    namesFilter,
    numsFilter,
    quantityFilter
} from "./tableFilters";
import {drawOrders} from "./drawOrders";
import {appAddr, state} from "./state";
import {bindOrdersListeners} from "./bindListeners";
import {getData} from "./getData";

let searchedOrders = []
let updatedOrders = []

export const getOrders = () => {
    // if (state["inWork"]) return
    fetch(`${appAddr}/api/orders/get-all`).then(res => res.json()).then(data => {
        state["filtered"] = false
        const nums = []
        const clients = []
        const materials = []
        const names = []
        const quantity = []
        const issued = []
        const managers = []
        const deadlines = []

        deleteTableFilters()
        deleteOrders()

        getData("users/get-users")
            .then(res => {
                data.data.forEach(d => {
                    state["orders"] = data.data
                    state["filteredOrders"] = state["orders"].filter(o => o)
                    searchedOrders = state["orders"].filter(o => o)

                    nums.push(d.number)
                    clients.push(d.client)
                    console.log(d.material)
                    materials.push(d.material)
                    names.push(d.name)
                    quantity.push(d.quantity)
                    issued.push(d.issued)
                    managers.push(d.m)
                    deadlines.push(d.deadlines)

                    if (!state['filtered']) {
                        state["managers"] = res.data.filter(user => user.group === "менеджер")
                    }
                    // console.log(d)

                    drawOrders(d, data, state["managers"])
                })
                drawTableFilter([...new Set(nums)], numsFilter)
                drawTableFilter([...new Set(clients)], clientsFilter)
                drawTableFilter([...new Set(materials)], materialsFilter)
                drawTableFilter([...new Set(names)], namesFilter)
                drawTableFilter([...new Set(quantity)], quantityFilter)
                drawTableFilter([...new Set(issued)], issuedFilter)
                drawTableFilter([...new Set(managers)], materialsFilter)
                drawTableFilter([...new Set(deadlines)], deadlineFilter)

                // if (document.querySelector(".orders__total") === null) {
                //     document.querySelector(".main__header").insertAdjacentHTML("beforeend", `
                //      <h3 class="orders__total">Всего в работе ${data.data.length}</h3>
                //     `)
                // }
                bindOrdersListeners()
                bindTableFilters()
            })


    })

}

export const deleteOrders = () => {
    const orders = document.querySelectorAll(".table-form")
    // document.querySelector(".orders__total").remove()

    orders.forEach(order => {
        order.remove()
    })
}

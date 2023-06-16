import {bindTableFilters, deleteTableFilters, drawTableFilters} from "./tableFilters";
import {drawOrders} from "./drawOrders";
import {appAddr, state} from "./domain";
import {bindOrdersListeners} from "./bindListeners";
import {getData} from "./getData";
import {drawManagers} from "./drawManagers";

let searchedOrders = []
let updatedOrders = []

export const getOrders = () => {
    // if (state["inWork"]) return
    fetch(`${appAddr}/api/orders/get-all`).then(res => res.json()).then(data => {
        state["filtered"] = false
        const nums = []
        const clients = []
        const materials = []
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
                    materials.push(d.material)

                    drawOrders(d, data, res.data.filter(user => user.group === "менеджер"))
                })
                drawTableFilters([...new Set(nums)], [...new Set(clients)], [...new Set(materials)])

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

export let appAddr = "http://192.168.1.230:8181"
export let inWork = false

const userInf = JSON.parse(sessionStorage.getItem("user"))

let state = {
    "filtered": false,
    "inWork": false,
    "newOrders": false,
    "orders": [],
    "filteredOrders": [],
    "currentRoute": null,
    "plots": [],
    "machines": [],
    "userInfo": {},
    "filterTypes": []
}

if (userInf) {
    state["adminCheck"] = userInf.group === 'супер-админ' || userInf.group === 'админ'
    state["techCheck"] = userInf.group === 'технолог'
}

export {state}
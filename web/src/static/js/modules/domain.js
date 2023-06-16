export let appAddr = "http://172.20.10.7:8181"
export let inWork = false

const userInf = JSON.parse(sessionStorage.getItem("user"))

export let state = {
    "filtered": false,
    "inWork": false,
    "newOrders": false,
    "orders": [],
    "filteredOrders": [],
    "currentRoute": null,
    "plots": [],
    "machines": [],
    "userInfo": {},
    "adminCheck": userInf.group === 'супер-админ' || userInf.group === 'админ',
    "techCheck": userInf.group === 'технолог'
}
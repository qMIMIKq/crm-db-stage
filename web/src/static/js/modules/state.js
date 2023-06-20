<<<<<<< HEAD
export let appAddr = "http://192.168.1.230:8181"
export let inWork = false

const userInf = JSON.parse(sessionStorage.getItem("user"))
=======
export let appAddr = 'http://192.168.1.230:8181'
const userInf = JSON.parse(sessionStorage.getItem('user'))
>>>>>>> 62f14ac58795e7c4dacb9d5c35a9a9522e502dfd

let state = {
    'filtered': false,
    'inWork': false,
    'newOrders': false,
    'orders': [],
    'filteredOrders': [],
    'currentRoute': null,
    'plots': [],
    'machines': [],
    'userInfo': {},
    'filterTypes': []
}

if (userInf) {
    state['adminCheck'] = userInf.group === 'супер-админ' || userInf.group === 'админ'
    state['techCheck'] = userInf.group === 'технолог'
    state['operCheck'] = userInf.group === 'оператор'
    state['managerCheck'] = userInf.group === 'менеджер'
}

export {state}
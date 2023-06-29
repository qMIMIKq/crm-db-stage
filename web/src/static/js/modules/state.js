//192.168.1.231
//172.20.10.7

export let appAddr = 'http://172.20.10.7:8181'
const userInf = JSON.parse(sessionStorage.getItem('user'))

let state = {
    'filtered': false,
    'inWork': false,
    'newOrders': false,
    'orders': [],
    'filteredOrders': [],
    'plots': [],
    'machines': [],
    'userInfo': {},
    'filterTypes': [],
    'topFilters': [],
    'currentTopFilters': [],
    'topPlots': [],
    'currentTopPlots': [],
    'deadlinesP': [1, 2, 3, 4, 5, 6, 7, 30],
}

if (userInf) {
    state['adminCheck'] = userInf.group === 'супер-админ' || userInf.group === 'админ'
    state['techCheck'] = userInf.group === 'технолог'
    state['operCheck'] = userInf.group === 'оператор'
    state['managerCheck'] = userInf.group === 'менеджер'
}

export {state}
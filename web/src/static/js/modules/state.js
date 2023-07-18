//192.168.1.231
//172.20.10.7

// let addr = process.env.CHECK
// console.log(addr)
export let appAddr = 'http://192.168.1.231:8182'
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
    'currentOrder': null,
    'openedOrders': [],
    'deadlinesP': [1, 2, 3, 4, 5, 6, 7, 30],
    'currentInput': null,
    'checkOrders': [],
    'isArchive': false,
    'tableFilters': {
        'number': '',
        'client': '',
        'material': '',
        'name': '',
        'quantity': '',
        'issued': '',
        'm': '',
        'end_time': '',
        'timestamp': '',
    },
    'routesFilters': {
        'started': false,
        'error': false,
        'uncompleted': false,
    }
}

if (userInf) {
    state['adminCheck'] = userInf.group === 'супер-админ' || userInf.group === 'админ'
    state['techCheck'] = userInf.group === 'технолог'
    state['operCheck'] = userInf.group === 'оператор'
    state['manCheck'] = userInf.group === 'менеджер'

    const admManCheck = state['adminCheck'] || state['manCheck']
    const admTechCheck = state['adminCheck'] || state['techCheck']
    const admManTechCheck = admManCheck || state['techCheck']

    state['inputAdmManGroupper'] = admManCheck ? '' : 'readonly'
    state['inputAdmManTechGroupper'] = admManTechCheck ? '' : 'readonly'
    state['inputAdmTechGroupper'] = admTechCheck ? '' : 'readonly'
    state['selectAdmManGroupper'] = admManCheck ? '' : 'disabled'
    state['selectAdmManTechGroupper'] = admManTechCheck ? '' : 'disabled'
}

export {state}
//192.168.1.231
//172.20.10.7
//91.142.94.150

// let addr = process.env.CHECK
// export let appAddr = 'http://91.142.94.150:8182'
// export let appAddr = 'http://192.168.1.231:8182'
export let appAddr = 'http://172.20.10.7:8182'
const userInf = JSON.parse(sessionStorage.getItem('user'))

let state = {
  'systemWords': ['Начал', 'Установил', 'Назначил', 'Выбрал', 'Закончил', 'Прошел', 'Сбросил', 'За смену', 'Просмотрел', 'Поставил маршрут'],
  'inPlanDate': '',
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
    'completed': false,
    'unstarted': false,
    'planned': false
  }
}

if (userInf) {
  console.log(userInf)
  state['adminCheck'] = userInf.groupId === '1' || userInf.groupId === '2'
  state['techCheck'] = userInf.groupId === '3'
  state['operCheck'] = userInf.groupId === '5'
  state['manCheck'] = userInf.groupId === '4'

  const admManCheck = state['adminCheck'] || state['manCheck']
  const admTechCheck = state['adminCheck'] || state['techCheck']
  const admManTechCheck = admManCheck || state['techCheck']

  state['inputAdmManGroupper'] = admManCheck ? '' : 'readonly'
  state['inputAdmManTechGroupper'] = admManTechCheck ? '' : 'readonly'
  state['inputAdmTechGroupper'] = admTechCheck ? '' : 'readonly'
  state['selectAdmManGroupper'] = admManCheck ? '' : 'disabled'
  state['selectAdmManTechGroupper'] = admManTechCheck ? '' : 'disabled'

  try {
    document.querySelector('.admin-form__user').textContent = userInf.nickname
  } catch {
  }
}

export {state}
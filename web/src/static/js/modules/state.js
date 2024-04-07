import {appAddr} from "../../../../../appAddr";

export const userInf = JSON.parse(localStorage.getItem('user'))

let state = {
  'systemWords': ['Начал', 'Установил', 'Назначил', 'Выбрал', 'Закончил', 'Прошел', 'Сбросил', 'За смену', 'Просмотрел', 'Поставил маршрут', 'Нажал паузу'],
  'inPlanDate': '',
  'startTime': '',
  'filtered': false,
  'searched': false,
  'inWork': false,
  'newOrders': false,
  'hideNotIncluded': false,
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
  'nums': [],
  'clients': [],
  'materials': [],
  'names': [],
  'quantity': [],
  'issued': [],
  'managers': [],
  'deadlines': [],
  'timestamps': [],
  'tableFilters': {
    // 'number': '',
    // 'client': '',
    // 'material': '',
    // 'name': '',
    // 'quantity': '',
    // 'issued': '',
    // 'm': '',
    // 'end_time': '',
    // 'timestamp': '',
  },
  'routesFilters': {
    'started': false,
    'error': false,
    'completed': false,
    'unstarted': false,
    'planned': false,
    'alert': false
  },
  'reports': [],
  'reportFilters': {
    'order_id': '',
    'number': '',
  }
}

if (userInf) {
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
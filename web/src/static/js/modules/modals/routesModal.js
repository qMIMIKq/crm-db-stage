import {showModal} from './showModal';
import {getData} from '../getData';
import {state} from '../state';
import {user} from '../../table';
import {sendData} from "../sendData";
import {showResult} from "../submitControl";
import {getTime} from "../getTime";
import {changeErrorHandler} from "./errorModal";
import {issuedHandlerModal} from "./issuedModal";
import {changePauseHandler} from "./pauseModal";
import {appAddr} from "../../../../../../appAddr";
import {planDateHandler} from "./planModal";
import {submitData} from "../submitOrdersData";
import {calcWorkingShiftsModal} from "./calcWorkingShiftsModal";

const routeModal = `
   <div id='modal' class='modal modal--route bounceIn'>
<!--        <div id='close_modal'>+</div>-->
        <div class='modal_content modal_content--route'>
            <div class='modal__header modal__header--routes modal-header'>
                <div class='modal-header__db'></div>
                <div class='modal-header__number'></div>
            </div>
            <form class='route__config' method='POST'>
                <div class="route__title">Общая информация:</div>
                <div class='route-block__wrapper'>
                    <div class='route__block user__block'>
                        <label class='route__label' for='route__plot'>Участок</label>
                        <select class='clickable route__select main__button main__select route__select--plot' name='plot' id='route__plot'>
                            <option selected disabled>Выберите участок</option>
                        </select>
                        
                        <select disabled class='hidden__input' id='plot-connection'>
                        </select>
                        
                        <label class='route__label' for='route__user'>Оператор</label>
                        <select disabled class='route__select main__button main__select route__select--user' name='user' id='route__user'>
                            <option selected disabled>Выберите оператора</option>
                        </select>
                    </div>
                    
                    <div class='route__block endtime__block'>
                        <label class='route__label' for='route__teorend'>Теоретическое</label>
                        <input style='cursor: default;text-align: center' readonly class='route__input--top table__data--ro main__input' name='theor_end' type='text' value="" id='route__teorend'>
                        
                        <label class='route__label label-plan__date' for='route__dynend'>В план</label>
                        <input id="plan_start" type="text" class="hidden__input" name="plan_start">
                        <input class="main__button main__input route__input route__input--top route-plan__date" 
                            name="plan_date"
                            disabled
                            readonly
                            id="route-plan__date"
                            type="text"
                            value="Не в плане"
                            tabindex="-1" 
                            autocomplete="off">
                            <!--                            disabled -->
              <!--                            onfocus="this.type='date'"-->
<!--                            onblur="(this.type='text')"-->
<!--                            <input type="checkbox" name="route__urgently" id="route-plan__urgently">-->
                    </div>
                    
                    <div class='route__block progress-block'>
                        <div class="quantity-block__labels">
                            <label class='route__label quantity-block__label' for='route__quantity'>Тираж</label>
                            <label class='route__label quantity-block__issued' for='day_quantity'>Выдано</label>
                        </div>
                        
                        <div class="quantity-block">
                          <input style='cursor: default' readonly class='route__input--top route__input--small text-input progress-block__input main__input' name='quantity' type='number' id='quantity' placeholder="Тираж">
                          <input readonly class='route__input--top route__input--small table__data--ro main__input progress-block__input' type='number' name='issued' id='route__issued'>
                          <input readonly class='hidden__input' type='number' name='issued_today' id='route__issued-today'>
                        </div>
                        
                        <div class="quantity-block__labels">
                            <label class='route__label quantity-block__inshifts' for='day_quantity'>В смену</label>
                            <label class='route__label quantity-block__shifts' for='shifts'>Смен</label>
                        </div>
                        
                        <div class="quantity-block quantity-block--rel">
                          <input readonly class='route__input--top route__input--small text-input progress-block__input main__input route-day__quantity' name='day_quantity' type='text' id='day_quantity' placeholder="В смену">
                          <input style='cursor: default' readonly class='route__input--top route__input--small text-input progress-block__input main__input' type='number' id='shifts' placeholder="Смен">
                        </div>
                    </div>
                </div>
                <div class="route__title">Статус:</div>
                <div class='route__section start-route'>
                    <input 
                    readonly
                    type='text'
                    placeholder='Время начала'
                    class='route__input route__input--middle main__button main__input start-route__time'
                    name='start_time' 
                    disabled
                    id='start-route__time'>
                    
<!--                    onfocus='(this.type='datetime-local')'
                    onblur='(this.type='text')'-->
                    
                    <button disabled type='button' class='route__btn main__button start-route__btn'>Начал</button>
                    
                    <input 
                    style="cursor: default; text-align: center"
                    readonly
                    type='text'
                    placeholder='Время паузы'
                    onblur='(this.type="text")'
                    class='route__input route__input--middle main__input pause-route__time'
                    name='pause_time' 
                    id='pause-route__time'>
                    
                    <input 
                    type='text'
                    class='hidden__input main__input'
                    name='pause_msg' 
                    id='pause-route__msg'>
                    
                    <button disabled type='button' class='route__btn main__button pause-route__btn'>Пауза</button>
                </div>
                
<!--                <div class='route__section end-route'>-->
<!--                    -->
<!--                </div>-->
                
                <div class='route__section pause-route'>
                  <input 
                    readonly
                    type='text'
                    placeholder='Время сдачи'
                    onblur='(this.type="text")'
                    class='route__input route__input--middle end-route__time main__button main__input'
                    name='end_time' 
                    id='end-route__time'>
                    
                  <button disabled type='button' class='route__btn main__button end-route__btn'>Сдал</button>
                  
                  
                  <input style="cursor: default"
                  type='text' 
                  readonly
                  class='route__input route__input--middle error__time main__input' 
                  id='error__time' 
                  placeholder="Время ошибки"
                  name='error_time'>
                  
                  <input 
                  type='text'
                  class='route__input route__input--middle hidden__input text-input main__input main__input'
                  name='error_msg' 
                  id='error-route__msg'>
                  
                  <button disabled type='button' class='route__btn main__button error-route__btn'>Ошибка!</button>
                  <button type='button' class='route__btn main__button hidden__input error-route__close'>Сбросить ошибку</button>
                </div>
                
                <div class="route__title">Требует внимания:</div>
                <div class='route__section route__section--report section-report'>
                    <!--                    <button type='button' class='clickable route__alert-btn main__button route__btn'>Внимание!</button>-->
<!--                    <select style="margin-bottom: 0" class="clickable route__select main__button main__select" name="chose-color" id="">-->
<!--                        <option selected disabled value="">Выберите цвет</option>-->
<!--                        <option style="color: red" value="red">Красный</option>-->
<!--                        <option style="color: yellow" value="yellow">Желтый</option>-->
<!--                        <option style="color: blue;" value="blue">Голубой</option>-->
<!--                    </select>-->
                
                    <button type='button' class='clickable route__alert-btn main__button route__btn'>
                        Красный    
                        <input class="hidden__input" type="text" name="color" id="" value="red">
                    </button>

                      <button type='button' class='clickable route__alert-btn route__btn main__button'>
                        Синий
                        <input class="hidden__input" type="text" name="color" id="" value="blue">
                      </button>
                      
                      <button type='button' class='clickable route__alert-btn route__btn main__button'>
                        Желтый
                        <input class="hidden__input" type="text" name="color" id="" value="#e5e516">
                      </button>
                      
                      <input class="hidden__input" readonly type="text" name="alert_color" id="alert_color">
                </div>
                
                <div class="route__title">Выдача:</div>
                <div class='route__section route__section--report section-report'>
                    <button disabled type='button' class='route__btn main__button issued-modal_trigger'>За смену</button>
                    <input class="hidden__input" readonly type="text" name="shift" id="shift">
                    <button style="align-self: flex-start" type='button' disabled class='clickable main__button route__btn report-route__btn'>Отчет</button>
                    
                    <div class='section-report__issued'>
                        <input 
                        type='text' 
                        class='hidden__input' 
                        id='issued_report'
                        name='issued_report'>
                        
                        <input
                        disabled
                        id='route-issued__today'
                        placeholder='За смену'
                        class='route__input main__button hidden__input main__input issued-route__num' 
                        type='number'>
                        
                        <input type='text'
                        class='hidden__input'
                        id='issued__all'>
                    </div>
                </div>
                
                <div class="route__title">Комментарии и логи событий:</div>
                
                <div class="section-logs__filter logs-filter">
                      <button class="logs-filter__button logs-filter__button--current" type="button">Комментарии</button>
                      <button class="logs-filter__button" type="button">Логи</button>
                      <button class="logs-filter__button" type="button">Все</button>
                </div>
                
                <div class='section-logs'>
                    <input 
                    class='route__comments hidden__input' 
                    id='route__comments' 
                    type='text' 
                    name='commentss'>
                    
                    <input name='comments' type="text" class="hidden__input" id="visible__comments">
                    <ul class='section-logs__list'>
                        
                    </ul>
                </div>
                <div class='section-logs__comment'>
                        <input class="hidden__input" type="text" name="last_comment" id="last_comment">
                    
                        <input
                        readonly
                        style="cursor: default"
                        class='section-logs__input main__input route__input' 
                        placeholder='Напишите комментарий'
                        type='text' 
                        name='route-comment' 
                        id='section-logs__comment'>
                        <button disabled type='button' class='section-logs__btn main__button send__comment'>Отправить</button>
                    </div>
                
                <div class='section-finish'>
                    <input id="route__delete" disabled class='section-finish__btn section-finish__delete' type='button' value="УДАЛИТЬ">
                    
                    <div class='section-finish__complete'>
                        <button disabled class='section-finish__btn section-finish__sub section-finish__sub--route main__button clickable' type='button'>Сохранить</button>
                    </div>
                </div>
            
            </form>
        </div>
   </div>
`
const issuedModal = `
   <div id='modal' style='z-index: 10000' class='modal modal--issued bounceIn'>
        <div class='modal_content modal_content--issued' style='width: 900px'>
            <div class='modal__header modal__header--routes modal-header'>
                <h2 class='comments__title'>Отчет по сменам</h2>
            </div>
                    
            <ul class='comment__prev issued-list'>
                <li style='text-align: center;background-color: rgb(156, 156, 156)' class='comment__item'>
                   <ul class="issued-top">
                      <li class="issued-top__item issued-top__item--date">Дата</li>
                      <li class="issued-top__item issued-top__item--operators">Операторы</li>
                      <li class="issued-top__item issued-top__item--plots">Станки</li>
                      <li class="issued-top__item issued-top__item--summary">Сдано</li>
                   </ul>
                </li>
            </ul>
        </div>
   </div>
`

const drawLogs = (data) => {
  const logsList = document.querySelector('.section-logs__list')
  const logsItems = logsList.querySelectorAll('.section-logs__item')
  if (logsItems !== null) {
    logsItems.forEach(item => {
      item.remove()
    })
  }

  const filter = document.querySelector('.logs-filter__button--current').textContent

  data.value.split('---').reverse().forEach(log => {
    if (log.trim() !== '') {
      let flag = true

      state.systemWords.forEach(word => {
        if (log.includes(word)) {
          flag = false
        }
      })

      if (filter === 'Все') {
        if (log.includes('ОШИБКА')) {
          logsList.insertAdjacentHTML(`beforeend`, `
          <li class='section-logs__item section-logs__item--error'>${log}</li>
        `)
        } else if (log.includes('REPORTMSG')) {
        } else if (log.includes('ПАУЗА')) {
          logsList.insertAdjacentHTML(`beforeend`, `
          <li class='section-logs__item section-logs__item--pause'>${log}</li>
        `)
        } else if (flag) {
          logsList.insertAdjacentHTML(`beforeend`, `
            <li class='section-logs__item'>${log}</li>
        `)
        } else {
          logsList.insertAdjacentHTML(`beforeend`, `
            <li class='section-logs__item section-logs__item--system'>${log}</li>
          `)
        }
      } else if (filter === 'Комментарии') {
        if (log.includes('ОШИБКА')) {
          logsList.insertAdjacentHTML(`beforeend`, `
          <li class='section-logs__item section-logs__item--error'>${log}</li>
        `)
        } else if (log.includes('REPORTMSG')) {
        } else if (log.includes('ПАУЗА')) {
          logsList.insertAdjacentHTML(`beforeend`, `
          <li class='section-logs__item section-logs__item--pause'>${log}</li>
        `)
        } else if (flag) {
          logsList.insertAdjacentHTML(`beforeend`, `
            <li class='section-logs__item'>${log}</li>
        `)
        }
      } else if (filter === 'Логи') {
        if (flag) {

        } else {
          logsList.insertAdjacentHTML(`beforeend`, `
            <li class='section-logs__item section-logs__item--system'>${log}</li>
          `)
        }
      }
    }
  })
}

const saveData = (data, selector) => {
  const dataInput = document.querySelector(selector)
  if (dataInput.value.length) {
    dataInput.value += '---' + data
  } else {
    dataInput.value = data
  }
  return dataInput
}

export const addReportMsg = (report, selector, filter) => {
  let logMsg = `REPORTMSG ${report}`
  const visible = saveData(logMsg, selector)
  saveData(logMsg, '#route__comments')
  drawLogs(visible, filter)
}

export const addLog = (name, log, selector) => {
  const today = getTime().replaceAll('-', '.')
  let logMsg = `${today}    ${name} ${log}`
  const visible = saveData(logMsg, selector)
  saveData(logMsg, '#route__comments')
  drawLogs(visible)
  return logMsg
}

export const activateOnInput = (e, cls) => {
  if (e.target.value !== '') {
    activateNextStage(cls)
  } else {
    disableBtn(cls)
  }
}

export const setDateToInput = inputId => {
  const today = getTime().replaceAll('-', '.')
  const timeInput = document.querySelector('#' + inputId)
  timeInput.value = today
}

export const activateNextStage = btnClass => {
  const btn = document.querySelector('.' + btnClass)
  btn.removeAttribute('disabled')
  btn.removeAttribute('readonly')
  btn.classList.add('clickable')
}

const disableBtn = btnClass => {
  const btn = document.querySelector('.' + btnClass)
  btn.setAttribute('disabled', 'true')
  btn.classList.remove('clickable')
}

export const confirmChangeTimeModal = `
    <div id='modal' style='z-index: 1000001' class='modal modal--confirm bounceIn'>
        <div class='modal_content modal_content--confirm' style='width: 350px'>
            <h2 class='confirm__title'>Подтвердить сброс времени?</h2>
            <div class='confirm__section'>
                <button class='main__button route__btn confirm__button confirm__button--ok'>Да</button>
                <button class='main__button route__btn confirm__button confirm__button--cncl'>Нет</button>
            </div>
        </div>
   </div>
`

export const confirmChangeTimeHandler = (e, operation, alertContent) => {
  if (e.target.value === '') {
    return
  }
  showModal(confirmChangeTimeModal)

  const modal = document.querySelector('.modal--confirm')
  const okBtn = modal.querySelector('.confirm__button--ok')
  const cncltn = modal.querySelector('.confirm__button--cncl')
  if (alertContent) {
    modal.querySelector('.confirm__title').textContent = alertContent
  }

  okBtn.addEventListener('click', () => {
    let logMsg
    switch (e.target.name) {
      case 'start_time':
        logMsg = 'Сбросил время начала'
        activateNextStage("route__select--plot")
        break
      case 'end_time':
        logMsg = 'Сбросил время сдачи'
        break
      case 'pause_time':
        logMsg = 'Сбросил время паузы'
        break
    }

    e.target.value = ''
    operation()
    modal.click()
    try {
      addLog(user.nickname, logMsg, '#visible__comments')
    } catch {
    }
  })

  cncltn.addEventListener('click', () => {
    modal.click()
  })
}

export const triggerRoutesModal = (e, page = 'main') => {
  const modalElem = showModal(routeModal)
  let logName = state['adminCheck'] || state['techCheck'] || state['manCheck'] ? user.nickname : ''

  const adminStatus = state['adminCheck'] || state['techCheck']
  const operStatus = state['operCheck']
  const manStatus = state['manCheck']

  let planned = false
  let info = false
  let routeInfo

  let routeInput
  if (page === 'main') {
    routeInfo = e.target.parentNode.querySelector('.hidden__input').value
    routeInput = e.target.parentNode.querySelector('.hidden__input')

    if (routeInfo !== '') {
      info = true
      routeInfo = JSON.parse(routeInfo)
    }
  } else {
    info = true
  }

  const currentOrder = e.target.parentNode.parentNode.parentNode.parentNode
  const routeQuantity = modalElem.querySelector('#quantity')
  const routeDayQuantity = modalElem.querySelector('#day_quantity')
  controlQuantityAccess(routeQuantity)
  // controlQuantityAccess(routeDayQuantity)
  // const canRemove = currentOrder.querySelector('#can-remove')
  // console.log(canRemove)

  const routeForm = modalElem.querySelector('.route__config')
  const issued = modalElem.querySelector('#route__issued')
  const visibleLogs = document.querySelector("#visible__comments")
  const issuedToday = modalElem.querySelector('#route-issued__today')
  const startTime = document.querySelector('.start-route__time')
  const endTime = document.querySelector('.end-route__time')
  const deleteBtn = document.querySelector('#route__delete')
  const theorEndInp = document.querySelector('#route__teorend')
  const shifts = document.querySelector('#shifts')
  const shift = document.querySelector('#shift')

  const doPause = (reset) => {
    if (reset) {
      pauseBtn.classList.remove('route-type__paused')
      pauseTimeInput.value = ''
    } else {
      pauseBtn.classList.add('route-type__paused')
    }

    if (!pauseBtn.classList.contains('route-type__paused')) {
      if (!reset) {
        setDateToInput('pause-route__time')
      }
      disableBtn('route__select--user')

      if (!planObj.planStart) {
        disableBtn('route-plan__date')
      }

      disableBtn('start-route__btn')
      disableBtn('start-route__time')
      disableBtn('issued-modal_trigger')


      disableBtn('end-route__btn')
      disableBtn('end-route__time')
    } else {
      pauseBtn.textContent = 'Пауза'

      activateNextStage('route__select--user')
      if (routePlot.value !== 'Выберите участок') {
        planDateInput.removeAttribute('disabled')
      }

      if (routeUser.value !== 'Выберите оператора') {
        if (startTime.value) {
          activateNextStage('issued-modal_trigger')
        } else {
          activateNextStage('start-route__btn')
        }
      }

      if (startTime.value) {
        activateNextStage('end-route__btn')
        activateNextStage('start-route__time')
      }

      if (endTime.value) {
        disableBtn('end-route__btn')
        activateNextStage('end-route__time')
      }
    }
  }

  const pauseBtn = routeForm.querySelector('.pause-route__btn')
  const pauseTimeInput = routeForm.querySelector('.pause-route__time')
  const pauseTextInput = document.querySelector('#pause-route__msg')
  pauseBtn.addEventListener('click', e => {
    changePauseHandler(e, pauseTextInput, pauseTimeInput, routeUser.value, doPause)
  })

  const issuedTodayStart = document.querySelector('#route__issued-today')
  const startBtn = routeForm.querySelector('.start-route__btn')
  const endBTn = routeForm.querySelector('.end-route__btn')
  const issuedBtn = routeForm.querySelector('.issued-modal_trigger')
  const alertBtns = modalElem.querySelectorAll('.route__alert-btn')
  const alertColor = modalElem.querySelector('#alert_color')
  const reportChanger = []
  // const dynEndInp = document.querySelector('#route__dynend')

  const planDateInputStart = document.querySelector('#plan_start')
  const planDateInput = document.querySelector('#route-plan__date')
  let planObj = {
    'exclude': '',
    'planStart': '',
    'planEnd': '',
    'faster': false
  }

  const errInput = document.querySelector('#error-route__msg')
  const errTime = document.querySelector('.error__time')
  const errBtn = routeForm.querySelector('.error-route__btn')
  errBtn.addEventListener('click', e => {
    changeErrorHandler(e, errInput, errTime, routeUser.value)
  })

  if (state['adminCheck'] || state['techCheck']) {
    document.querySelector('.start-route__time').removeAttribute('disabled')
    activateNextStage('route__select--plot')
    planDateInput.removeAttribute('disabled')

    startTime.addEventListener('click', e => {
      confirmChangeTimeHandler(e, () => {
        activateNextStage('start-route__btn')
        startBtn.classList.remove('route-type__start')
        endBTn.classList.remove('route-type__finish')
        endTime.value = ''
        disableBtn('end-route__btn')
      })
    })

    endTime.addEventListener('click', e => {
      confirmChangeTimeHandler(e, () => {
        endBTn.classList.remove('route-type__finish')
        activateNextStage('end-route__btn')
      })
    })
  }

  const commentInput = document.querySelector('#section-logs__comment')
  commentInput.addEventListener('input', e => {
    activateOnInput(e, 'send__comment')
  })
  const commentBtn = document.querySelector('.send__comment')
  commentBtn.addEventListener('click', e => {
    let name
    if (logName === '') {
      name = routeUser.value
    } else {
      name = logName
    }

    let log = `${document.querySelector('#section-logs__comment').value}`

    addLog(name, log, '#visible__comments')

    modalElem.querySelector('#last_comment').value = `${name} ${log}`
    document.querySelector('#section-logs__comment').value = ''
    disableBtn('send__comment')
  })

  let addedDates = []
  let dbAddedDates = []
  let dayQuantityInfo = {
    'up': 0,
    'adjustment': 0,
    'time': 0,
    'quantity': 0,
  }

  const routeUser = document.querySelector('.route__select--user')

  if (info) {
    if (page === 'report') {
      const routeID = e.target.parentNode.parentNode.querySelector('#route_id').value
      sendData(`${appAddr}/api/routes/get-route`, 'POST', Number(routeID))
        .then(resp => {
          return resp.json()
        })
        .then(data => {
          routeInfo = data.data

          planDateInput.removeAttribute('disabled')
          let comments = routeInfo['comments']
          if (routeInfo['last_comment']) {
            document.querySelector('#last_comment').value = routeInfo['last_comment']
          }
          if (routeInfo.issued_today) {
            issuedTodayStart.value = Number(issuedTodayStart.value) + Number(routeInfo.issued_today)
          }

          shift.value = routeInfo.shift

          planned = routeInfo['planned']

          // if (planned) {
          //   planDateInput.value = 'В планировании'
          // }

          if (routeInfo['db_plan']) {
            let today = getTime()
            today = today.substring(0, today.length - 5).trim()

            dbAddedDates = routeInfo['db_plan']
            planDateInput.value = 'В плане'

            dbAddedDates.map(dateInfo => {
              dateInfo['queues'] = dateInfo['queues'].split(', ')
              dateInfo['date'] = dateInfo['date'].split('T')[0]

              if (today === dateInfo['date']) {
                planDateInput.style.border = '2px solid rgba(0, 130, 29, 1)'
              }

              addedDates[dateInfo['date']] = {
                'divider': dateInfo.divider,
                'queues': dateInfo.queues
              }
            })
          }

          planObj = {
            'exclude': routeInfo['exclude_days'],
            'planStart': routeInfo['plan_start'],
            'planEnd': routeInfo['plan_date'],
            'faster': routeInfo['plan_faster']
          }

          if (routeInfo['issued']) {
            issued.value = routeInfo['issued']

            if (!operStatus) {
              activateNextStage('report-route__btn')
            }
          }

          if (logName !== '') {
            deleteBtn.removeAttribute('disabled')
            deleteBtn.addEventListener('click', e => {
              confirmChangeTimeHandler(e, () => {
                sendData(`${appAddr}/api/routes/delete/${routeInfo['route_id']}`, 'POST', null)
                  .then(resp => {
                    if (resp.ok) showResult(true)
                    routeInput.value = ""
                    const infoParent = routeInput.parentNode
                    const routeInfo = infoParent.querySelector(`.click-chose`)
                    routeInfo.value = '-'
                    routeInfo.classList.remove('route', 'route--started', 'route--completed', 'route--error', 'route--paused', 'route--planned')
                    modalElem.remove()
                    const parent = routeInput.closest('.table-form--old')
                    if (!(parent === null)) {
                      parent.classList.remove('table-form--old')
                      parent.classList.add('table-form--upd')
                      submitData()
                    }

                    // getOrders('get-all', true)
                  })
              }, 'Удалить маршрут?')
            })
          }

          alertColor.value = routeInfo.alert_color
          alertBtns.forEach(btn => {
            let checkColor = btn.querySelector('.hidden__input').value
            if (alertColor.value === checkColor) {
              btn.classList.add('route__alert-btn--chosen')
              btn.style.cssText = `
                color: ${checkColor};
                border: 2px solid ${checkColor};
              `
              alertColor.value = checkColor
            }
          })

          if (routeInfo['start_time']) {
            disableBtn('route__select--plot')
          }

          if (routeInfo.user) {
            routeUser.insertAdjacentHTML('beforeend', `
        <option selected value="${routeInfo['user']}">${routeInfo['user']}</option>
      `)
          }

          drawPlots(routeInfo['plot'], routeInfo['user'])

          activateNextStage('route__select--user')
          activateNextStage('pause-route__btn')

          if (routeInfo['user']) {
            activateNextStage('error-route__btn')
          }

          if (logName !== '') {
            controlCommentAccess(commentInput)
          }

          if (routeInfo['user']) {
            controlCommentAccess(commentInput)

            if (routeInfo.start_time) {
              activateNextStage('issued-modal_trigger')
            }
          }

          if (!routeInfo['start_time'] && routeInfo.user) {
            activateNextStage('start-route__btn')
          } else if (routeInfo.start_time) {
            activateNextStage('end-route__btn')
            startBtn.classList.add('route-type__start')
          }

          startTime.value = routeInfo['start_time']
          endTime.value = routeInfo['end_time']
          errInput.value = routeInfo['error_msg']
          errTime.value = routeInfo['error_time']

          theorEndInp.value = routeInfo['theor_end'] ? routeInfo['theor_end'] : ''
          // dynEndInp.value = dynEnd ? dynEnd : ''

          if (routeInfo['plan_date']) {
            planDateInput.value = routeInfo['plan_date']
            planDateInputStart.value = routeInfo['plan_start']
            planDateInput.classList.add('route-type__finish')
          } else {
            planDateInput.classList.remove('route-type__finish')
          }

          if (comments) {
            comments = comments.map(c => `${c['date']}    ${c['value']}`)
            comments = comments.join('---')
            visibleLogs.value = comments

            comments = comments.split('---')
            comments = comments.filter(c => c.includes('REPORTMSG'))
            modalElem.querySelector('#issued__all').value = comments.join('---')
          }

          activateNextStage('section-finish__sub')

          if (routeInfo['quantity']) {
            routeQuantity.value = routeInfo['quantity']
            // dayQuantityInfo['quantity'] = routeInfo['quantity']
            // controlQuantityAccess(routeDayQuantity)
          } else {
            const quant = currentOrder.querySelector('input[name="quantity"]').value
            routeQuantity.value = quant
            // dayQuantityInfo['quantity'] = quant
          }

          if (routeInfo['day_quantity']) {
            // controlQuantityAccess(routeDayQuantity)
            routeDayQuantity.value = routeInfo['day_quantity']
          }

          shifts.value = routeInfo.need_shifts

          if (routeInfo['end_time']) {
            disableBtn('end-route__btn')
            disableBtn('pause-route__btn')
            endBTn.classList.add('route-type__finish')
          }

          if (routeInfo['error_msg']) {
            errInput.setAttribute('disabled', '')
            errBtn.classList.add('route-type__error')

            if (state['adminCheck'] || state['techCheck']) {
            }
          }

          if (routeInfo['start_time']) {
            issuedToday.classList.add('text-input')
            issuedToday.removeAttribute('disabled')
          }

          if (routeInfo['pause_time']) {
            pauseTimeInput.value = routeInfo['pause_time']
            pauseTextInput.value = routeInfo['pause_msg']
            pauseBtn.textContent = 'Пауза'
            pauseBtn.classList.add('route-type__paused')
            disableBtn('route__select--user')

            if (!planObj.planStart) {
              disableBtn('route-plan__date')
            }

            disableBtn('start-route__btn')
            disableBtn('start-route__time')
            disableBtn('issued-modal_trigger')


            disableBtn('end-route__btn')
            disableBtn('end-route__time')
          }

          dayQuantityInfo = {
            'up': routeInfo.up || 0,
            'adjustment': routeInfo.adjustment || 0,
            'time': routeInfo.time || 0,
            'quantity': routeInfo.quantity || currentOrder.querySelector('input[name="quantity"]').value || 0,
          }
        })
    } else {
      planDateInput.removeAttribute('disabled')
      let comments = routeInfo['comments']
      if (routeInfo['last_comment']) {
        document.querySelector('#last_comment').value = routeInfo['last_comment']
      }
      if (routeInfo.issued_today) {
        issuedTodayStart.value = Number(issuedTodayStart.value) + Number(routeInfo.issued_today)
      }

      shift.value = routeInfo.shift
      alertColor.value = routeInfo.alert_color

      planned = routeInfo['planned']

      // if (planned) {
      //   planDateInput.value = 'В планировании'
      // }

      if (routeInfo['db_plan']) {
        let today = getTime()
        today = today.substring(0, today.length - 5).trim()

        dbAddedDates = routeInfo['db_plan']
        planDateInput.value = 'В плане'

        dbAddedDates.map(dateInfo => {
          dateInfo['queues'] = dateInfo['queues'].split(', ')
          dateInfo['date'] = dateInfo['date'].split('T')[0]

          if (today === dateInfo['date']) {
            planDateInput.style.border = '2px solid rgba(0, 130, 29, 1)'
          }

          addedDates[dateInfo['date']] = {
            'divider': dateInfo.divider,
            'queues': dateInfo.queues
          }
        })
      }

      planObj = {
        'exclude': routeInfo['exclude_days'],
        'planStart': routeInfo['plan_start'],
        'planEnd': routeInfo['plan_date'],
        'faster': routeInfo['plan_faster']
      }

      if (routeInfo['issued']) {
        issued.value = routeInfo['issued']

        if (!operStatus) {
          activateNextStage('report-route__btn')
        }
      }

      if (logName !== '') {
        deleteBtn.removeAttribute('disabled')
        deleteBtn.addEventListener('click', e => {
          confirmChangeTimeHandler(e, () => {
            sendData(`${appAddr}/api/routes/delete/${routeInfo['route_id']}`, 'POST', null)
              .then(resp => {
                if (resp.ok) showResult(true)
                routeInput.value = ""
                const infoParent = routeInput.parentNode
                const routeInfo = infoParent.querySelector(`.click-chose`)
                routeInfo.value = '-'
                routeInfo.classList.remove('route', 'route--started', 'route--completed', 'route--error', 'route--paused', 'route--planned')
                modalElem.remove()
                const parent = routeInput.closest('.table-form--old')
                if (!(parent === null)) {
                  parent.classList.remove('table-form--old')
                  parent.classList.add('table-form--upd')
                  submitData()
                }

                // getOrders('get-all', true)
              })
          }, 'Удалить маршрут?')
        })
      }

      if (routeInfo['start_time']) {
        disableBtn('route__select--plot')
      }

      if (routeInfo.user) {
        routeUser.insertAdjacentHTML('beforeend', `
          <option selected value="${routeInfo['user']}">${routeInfo['user']}</option>
        `)
      }

      drawPlots(routeInfo['plot'], routeInfo['user'])

      activateNextStage('route__select--user')
      activateNextStage('pause-route__btn')

      if (routeInfo['user']) {
        activateNextStage('error-route__btn')
      }

      if (logName !== '') {
        controlCommentAccess(commentInput)
      }

      if (routeInfo['user']) {
        controlCommentAccess(commentInput)

        if (routeInfo.start_time) {
          activateNextStage('issued-modal_trigger')
        }
      }

      if (!routeInfo['start_time'] && routeInfo.user) {
        activateNextStage('start-route__btn')
      } else if (routeInfo.start_time) {
        activateNextStage('end-route__btn')
        startBtn.classList.add('route-type__start')
      }

      startTime.value = routeInfo['start_time']
      endTime.value = routeInfo['end_time']
      errInput.value = routeInfo['error_msg']
      errTime.value = routeInfo['error_time']

      theorEndInp.value = routeInfo['theor_end'] ? routeInfo['theor_end'] : ''
      // dynEndInp.value = dynEnd ? dynEnd : ''

      if (routeInfo['plan_date']) {
        planDateInput.value = routeInfo['plan_date']
        planDateInputStart.value = routeInfo['plan_start']
        planDateInput.classList.add('route-type__finish')
      } else {
        planDateInput.classList.remove('route-type__finish')
      }

      if (comments) {
        comments = comments.map(c => `${c['date']}    ${c['value']}`)
        comments = comments.join('---')
        visibleLogs.value = comments

        comments = comments.split('---')
        comments = comments.filter(c => c.includes('REPORTMSG'))
        modalElem.querySelector('#issued__all').value = comments.join('---')
      }

      activateNextStage('section-finish__sub')

      if (routeInfo['quantity']) {
        routeQuantity.value = routeInfo['quantity']
        // dayQuantityInfo['quantity'] = routeInfo['quantity']
        // controlQuantityAccess(routeDayQuantity)
      } else {
        const quant = currentOrder.querySelector('input[name="quantity"]').value
        routeQuantity.value = quant
        // dayQuantityInfo['quantity'] = quant
      }

      if (routeInfo['day_quantity']) {
        // controlQuantityAccess(routeDayQuantity)
        routeDayQuantity.value = routeInfo['day_quantity']
      }

      shifts.value = routeInfo.need_shifts

      if (routeInfo['end_time']) {
        disableBtn('end-route__btn')
        disableBtn('pause-route__btn')
        endBTn.classList.add('route-type__finish')
      }

      if (routeInfo['error_msg']) {
        errInput.setAttribute('disabled', '')
        errBtn.classList.add('route-type__error')

        if (state['adminCheck'] || state['techCheck']) {
        }
      }

      if (routeInfo['start_time']) {
        issuedToday.classList.add('text-input')
        issuedToday.removeAttribute('disabled')
      }

      if (routeInfo['pause_time']) {
        pauseTimeInput.value = routeInfo['pause_time']
        pauseTextInput.value = routeInfo['pause_msg']
        pauseBtn.textContent = 'Пауза'
        pauseBtn.classList.add('route-type__paused')
        disableBtn('route__select--user')

        if (!planObj.planStart) {
          disableBtn('route-plan__date')
        }

        disableBtn('start-route__btn')
        disableBtn('start-route__time')
        disableBtn('issued-modal_trigger')


        disableBtn('end-route__btn')
        disableBtn('end-route__time')
      }

      dayQuantityInfo = {
        'up': routeInfo.up || 0,
        'adjustment': routeInfo.adjustment || 0,
        'time': routeInfo.time || 0,
        'quantity': routeInfo.quantity || currentOrder.querySelector('input[name="quantity"]').value || 0,
      }
    }

  } else {
    routeQuantity.value = currentOrder.querySelector('input[name="quantity"]').value
    disableBtn('route-plan__date')
    drawPlots()
    dayQuantityInfo['quantity'] = routeQuantity.value
  }

  alertBtns.forEach(btn => {
    let checkColor = btn.querySelector('.hidden__input').value
    if (alertColor.value === checkColor) {
      btn.classList.add('route__alert-btn--chosen')
      btn.style.cssText = `
          color: ${checkColor};
          border: 2px solid ${checkColor};
        `
      alertColor.value = checkColor
    }

    btn.addEventListener('click', e => {
      let btnColor = btn.querySelector('.hidden__input').value

      alertBtns.forEach(outerBtn => {
        if (btn !== outerBtn) {
          outerBtn.classList.remove('route__alert-btn--chosen')
        }

        outerBtn.style.cssText = `
          color: rgb(66, 66, 66);
          border: 1px solid rgb(173, 173, 173);
        `
      })

      if (!btn.classList.contains('route__alert-btn--chosen')) {
        btn.classList.add('route__alert-btn--chosen')
        btn.style.cssText = `
          color: ${btnColor};
          border: 2px solid ${btnColor};
        `
        alertColor.value = btnColor
      } else {
        console.log('chosen now')
        btn.classList.remove('route__alert-btn--chosen')
        btn.style.cssText = `
          color: rgb(66, 66, 66);
          border: 1px solid rgb(173, 173, 173);
        `
        alertColor.value = ''
      }
    })
  })

  const dayQuantity = document.querySelector('#day_quantity')
  dayQuantity.addEventListener('click', e => {
    calcWorkingShiftsModal(e.target, dayQuantityInfo, () => {
      getTheorEndTime(routeQuantity.value, routeDayQuantity.value, issued.value, startTime.value, theorEndInp, shifts, dayQuantityInfo, dayQuantity)
    })
  })

  dayQuantity.addEventListener('mouseenter', e => {
    if (e.target.value) {
      e.target.insertAdjacentHTML('afterend', `
        <div class="check-helper">VALUE</div>
      `)

      const helper = modalElem.querySelector('.check-helper')
      if (helper) {
        const helperHeight = helper.clientHeight
        if (helperHeight > 23) {
          helper.style.bottom = '-' + String(helperHeight - 23 + 25) + 'px'
          helper.style.left = '-48px'
        } else {
          helper.style.bottom = '-35px'
          helper.style.left = '-48px'
        }
      }

      if (e.target.value.includes('/')) {
        helper.textContent = 'Первая/Средняя'
      } else {
        helper.textContent = 'Средняя'
      }
    }
  })

  dayQuantity.addEventListener('mouseleave', e => {
    try {
      modalElem.querySelector('.check-helper').remove()
    } catch {
    }
  })

  routeQuantity.addEventListener('change', e => {
    activateOnInput(e, 'section-finish__sub')
    addLog(logName, `Установил тираж в ${e.target.value}`, '#visible__comments')
    // getTheorEndTime(routeQuantity.value, routeDayQuantity.value, issued.value, startTime.value, theorEndInp, shifts, dayQuantityInfo, dayQuantity)
    dayQuantityInfo['quantity'] = e.target.value
    modalElem.querySelector('#day_quantity').click()
    document.querySelector('.confirm__button--search__theor').click()

    console.log(dayQuantityInfo)
  })

  routeDayQuantity.addEventListener('change', e => {
    activateOnInput(e, 'section-finish__sub')
    addLog(logName, `Установил дневной тираж в ${e.target.value}`, '#visible__comments')
    getTheorEndTime(routeQuantity.value, routeDayQuantity.value, issued.value, startTime.value, theorEndInp, shifts, dayQuantityInfo, dayQuantity)
  })


  let plannedObj = {
    'planned': planned
  }

  issuedBtn.addEventListener('click', e => {
    issuedHandlerModal(e, issued, issuedTodayStart, routePlot.value, routeUser, reportChanger, shift, startTime)
  })

  planDateInput.addEventListener('click', e => {
    // planned = true
    // planDateInput.value = 'В планировании'

    if (info) {
      planDateHandler(addedDates, routePlot.value, routeInfo['route_id'], plannedObj, planDateInput, shifts.value)
    } else {
      planDateHandler(addedDates, routePlot.value, '0', plannedObj, planDateInput, shifts.value)
    }
  })

  if (operStatus || manStatus) {
    disableBtn('route__select--plot')
    disableBtn('report-route__btn')
    disableBtn('section-finish__delete')
    disableBtn('route-plan__date')
    disableBtn('end-route__time')
    // modalElem.querySelector('.logs-filter').classList.add('hidden__input')
  }

  if (manStatus) {
    disableBtn('route__select--user')
    disableBtn('start-route__btn')
    disableBtn('end-route__btn')
    disableBtn('pause-route__btn')
    disableBtn('error-route__btn')
    disableBtn('issued-modal_trigger')
  }

  const dbID = currentOrder.querySelector('#db_id').value
  const num = currentOrder.querySelector('#number').value
  modalElem.querySelector('.modal-header__db').textContent = '№' + dbID
  modalElem.querySelector('.modal-header__number').textContent = '№ заказа ' + num

  const routePlot = document.querySelector('#route__plot')
  routePlot.addEventListener('change', e => {
    const connector = document.querySelector('#plot-connection')
    let plotName = ''

    connector.querySelectorAll('option').forEach(conn => {
      if (e.target.value === conn.value) {
        plotName = conn.textContent
      }
    })

    addLog(logName, `Выбрал этап ${routePlot.value}`, '#visible__comments')
    drawUsers(plotName, null, true)
    activateNextStage('route__select--user')
    activateNextStage('section-finish__sub')
    activateNextStage('pause-route__btn')
    activateNextStage('error-route__btn')
    activateNextStage('section-logs__input')
    planDateInput.removeAttribute('disabled')
    controlQuantityAccess(routeQuantity)
    controlCommentAccess(commentInput)
  })

  const prevUserVal = routeUser.value
  routeUser.addEventListener('change', () => {
    addLog(logName, `Назначил оператора ${routeUser.value}`, '#visible__comments')

    if (prevUserVal === 'Выберите оператора') {
      activateNextStage('start-route__btn')
      activateNextStage('error-route__btn')
      controlCommentAccess(commentInput)
    }
  })

  drawLogs(visibleLogs)
  startBtn.addEventListener('click', () => {
    setDateToInput('start-route__time')
    if (!pauseTimeInput.value) {
      activateNextStage('end-route__btn')
    }

    activateNextStage('pause-route__btn')
    activateNextStage('section-finish__sub')
    activateNextStage('issued-modal_trigger')
    disableBtn('start-route__btn')
    disableBtn('route__select--plot')
    addLog(routeUser.value, 'Начал', '#visible__comments')
    issuedToday.classList.add('text-input')
    issuedToday.removeAttribute('disabled')
    startBtn.classList.add('route-type__start')

    getTheorEndTime(routeQuantity.value, routeDayQuantity.value, issued.value, startTime.value, theorEndInp, shifts, dayQuantityInfo, dayQuantity)
  })

  // END
  endBTn.addEventListener('click', () => {
    setDateToInput('end-route__time')
    disableBtn('end-route__btn')
    disableBtn('pause-route__btn')
    endBTn.classList.add('route-type__finish')
    addLog(routeUser.value, 'Закончил', '#visible__comments')
  })

  // REPORT ISSUED
  const reportIssued = document.querySelector('.report-route__btn')
  reportIssued.addEventListener('click', () => {
    const iM = showModal(issuedModal)
    const dataPlace = iM.querySelector('.issued-list')

    const res = {}
    document.querySelector('#issued__all').value.split('---').forEach(rep => {
      if (rep.trim() !== '') {
        rep = rep.replaceAll('REPORTMSG', '').trim().split('__')
        if (res.hasOwnProperty(rep[0])) {
          res[rep[0]]['operators'].push(rep[1])
          res[rep[0]]['plots'].push(rep[2])
          res[rep[0]]['summary'] += Number(rep[3])
        } else {
          res[rep[0]] = {
            'operators': [rep[1]],
            'plots': [rep[2]],
            'summary': Number(rep[3]),
          }
        }
      }
    })

    for (const [date, info] of Object.entries(res)) {
      let operators = [...new Set(info.operators)].join('/')
      let plots = [...new Set(info.plots)].join('/')

      dataPlace.insertAdjacentHTML(`beforeend`, `
        <li style='text-align: center' class='comment__item'>
          <ul class="issued-top">
            <li class="issued-top__item issued-top__item--date">${date}</li>
            <li class="issued-top__item issued-top__item--operators">${operators}</li>
            <li class="issued-top__item issued-top__item--plots">${plots}</li>
            <li class="issued-top__item issued-top__item--summary">${info.summary}</li>
          </ul>
        </li>
      `)
    }

    addLog(logName, 'Просмотрел отчет по сменам', '#visible__comments')
  })

  const logsFilters = document.querySelectorAll('.logs-filter__button')
  logsFilters.forEach(filter => {
    filter.addEventListener('click', e => {
      logsFilters.forEach(btn => btn.classList.remove('logs-filter__button--current'))
      filter.classList.add('logs-filter__button--current')
      drawLogs(visibleLogs)
    })
  })

  window.addEventListener('keydown', subCommentByEnter)
  modalElem.querySelector('.section-finish__sub').addEventListener('click', () => {
    modalElem.querySelectorAll('.route__input').forEach(input => {
      input.removeAttribute('disabled')
    })

    const formData = new FormData(routeForm)
    const obj = {}
    formData.forEach((value, key) => {
      obj[key] = value
    })

    let resAddedDates = []
    for (const [addedDate, entry] of Object.entries(addedDates)) {
      resAddedDates.push({
        'date': addedDate,
        'date_info': entry
      })
    }

    obj['plot'] = routeForm.querySelector('#route__plot').value
    obj['comments'] = createReportObj(obj['comments'])
    obj['error_msg'] = errInput.value
    obj['plan_date'] = planObj.planEnd
    obj['plan_start'] = planObj.planStart
    obj['plan_faster'] = planObj.faster
    obj['exclude_days'] = planObj.exclude
    obj['route_id'] = routeInfo.route_id
    obj['report_changer'] = reportChanger
    obj['planned'] = plannedObj['planned']
    obj['issued_today'] = issuedTodayStart.value
    obj['added_dates'] = resAddedDates
    obj['report_changer'] = reportChanger.sort((a, b) => a.date > b.date ? 1 : -1)
    obj['up'] = dayQuantityInfo.up
    obj['time'] = dayQuantityInfo.time
    obj['adjustment'] = dayQuantityInfo.adjustment
    obj['need_shifts'] = Number(shifts.value)
    obj['alert_color'] = alertColor.value
    // console.log(alertColor.value)
    // obj['planned'] = !!(dbID && planned)

    if (page === 'main') {
      routeInput.value = JSON.stringify(obj)
      const parent = routeInput.closest('.table-form--old')

      if (!(parent === null)) {
        parent.classList.remove('table-form--old')
        parent.classList.add('table-form--upd')
        //   sendData(`${appAddr}/api/reports/update`, 'POST', JSON.stringify(obj))
      }
      submitData()
    } else {
      obj['order_id'] = currentOrder.querySelector('#db_id').value
      obj['route_position'] = currentOrder.querySelector('#route_position').value

      sendData(`${appAddr}/api/routes/update-route`, 'POST', JSON.stringify(obj))
        .then(resp => {
          console.log(resp.ok)
        })
    }

    document.querySelector('.modal--route').remove()
    window.removeEventListener('keydown', subCommentByEnter)
  })

  if (state['isArchive']) {
    modalElem.querySelectorAll('input').forEach(inp => {
      inp.setAttribute('disabled', 'true')
    })
    modalElem.querySelectorAll('select').forEach(sel => {
      sel.setAttribute('disabled', 'true')
    })
  }
}

const setRouteData = (routeInfo) => {
  // planDateInput.removeAttribute('disabled')
  // let comments = routeInfo['comments']
  // if (routeInfo['last_comment']) {
  //   document.querySelector('#last_comment').value = routeInfo['last_comment']
  // }
  // if (routeInfo.issued_today) {
  //   issuedTodayStart.value = Number(issuedTodayStart.value) + Number(routeInfo.issued_today)
  // }
  //
  // shift.value = routeInfo.shift
  //
  // planned = routeInfo['planned']
  //
  // // if (planned) {
  // //   planDateInput.value = 'В планировании'
  // // }
  //
  // if (routeInfo['db_plan']) {
  //   let today = getTime()
  //   today = today.substring(0, today.length - 5).trim()
  //
  //   dbAddedDates = routeInfo['db_plan']
  //   planDateInput.value = 'В плане'
  //
  //   dbAddedDates.map(dateInfo => {
  //     dateInfo['queues'] = dateInfo['queues'].split(', ')
  //     dateInfo['date'] = dateInfo['date'].split('T')[0]
  //
  //     if (today === dateInfo['date']) {
  //       planDateInput.style.border = '2px solid rgba(0, 130, 29, 1)'
  //     }
  //
  //     addedDates[dateInfo['date']] = {
  //       'divider': dateInfo.divider,
  //       'queues': dateInfo.queues
  //     }
  //   })
  // }
  //
  // planObj = {
  //   'exclude': routeInfo['exclude_days'],
  //   'planStart': routeInfo['plan_start'],
  //   'planEnd': routeInfo['plan_date'],
  //   'faster': routeInfo['plan_faster']
  // }
  //
  // if (routeInfo['issued']) {
  //   issued.value = routeInfo['issued']
  //
  //   if (!operStatus) {
  //     activateNextStage('report-route__btn')
  //   }
  // }
  //
  // if (logName !== '') {
  //   deleteBtn.removeAttribute('disabled')
  //   deleteBtn.addEventListener('click', e => {
  //     confirmChangeTimeHandler(e, () => {
  //       sendData(`${appAddr}/api/routes/delete/${routeInfo['route_id']}`, 'POST', null)
  //         .then(resp => {
  //           if (resp.ok) showResult(true)
  //           routeInput.value = ""
  //           const infoParent = routeInput.parentNode
  //           const routeInfo = infoParent.querySelector(`.click-chose`)
  //           routeInfo.value = '-'
  //           routeInfo.classList.remove('route', 'route--started', 'route--completed', 'route--error', 'route--paused', 'route--planned')
  //           modalElem.remove()
  //           const parent = routeInput.closest('.table-form--old')
  //           if (!(parent === null)) {
  //             parent.classList.remove('table-form--old')
  //             parent.classList.add('table-form--upd')
  //             submitData()
  //           }
  //
  //           // getOrders('get-all', true)
  //         })
  //     }, 'Удалить маршрут?')
  //   })
  // }
  //
  // if (routeInfo['start_time']) {
  //   disableBtn('route__select--plot')
  // }
  //
  // if (routeInfo.user) {
  //   routeUser.insertAdjacentHTML('beforeend', `
  //     <option selected value="${routeInfo['user']}">${routeInfo['user']}</option>
  //   `)
  // }
  //
  // drawPlots(routeInfo['plot'], routeInfo['user'])
  //
  // activateNextStage('route__select--user')
  // activateNextStage('pause-route__btn')
  //
  // if (routeInfo['user']) {
  //   activateNextStage('error-route__btn')
  // }
  //
  // if (logName !== '') {
  //   controlCommentAccess(commentInput)
  // }
  //
  // if (routeInfo['user']) {
  //   controlCommentAccess(commentInput)
  //
  //   if (routeInfo.start_time) {
  //     activateNextStage('issued-modal_trigger')
  //   }
  // }
  //
  // if (!routeInfo['start_time'] && routeInfo.user) {
  //   activateNextStage('start-route__btn')
  // } else if (routeInfo.start_time) {
  //   activateNextStage('end-route__btn')
  //   startBtn.classList.add('route-type__start')
  // }
  //
  // startTime.value = routeInfo['start_time']
  // endTime.value = routeInfo['end_time']
  // errInput.value = routeInfo['error_msg']
  // errTime.value = routeInfo['error_time']
  //
  // theorEndInp.value = routeInfo['theor_end'] ? routeInfo['theor_end'] : ''
  // // dynEndInp.value = dynEnd ? dynEnd : ''
  //
  // if (routeInfo['plan_date']) {
  //   planDateInput.value = routeInfo['plan_date']
  //   planDateInputStart.value = routeInfo['plan_start']
  //   planDateInput.classList.add('route-type__finish')
  // } else {
  //   planDateInput.classList.remove('route-type__finish')
  // }
  //
  // if (comments) {
  //   comments = comments.map(c => `${c['date']}    ${c['value']}`)
  //   comments = comments.join('---')
  //   visibleLogs.value = comments
  //
  //   comments = comments.split('---')
  //   comments = comments.filter(c => c.includes('REPORTMSG'))
  //   modalElem.querySelector('#issued__all').value = comments.join('---')
  // }
  //
  // activateNextStage('section-finish__sub')
  //
  // if (routeInfo['quantity']) {
  //   routeQuantity.value = routeInfo['quantity']
  //   // dayQuantityInfo['quantity'] = routeInfo['quantity']
  //   // controlQuantityAccess(routeDayQuantity)
  // } else {
  //   const quant = currentOrder.querySelector('input[name="quantity"]').value
  //   routeQuantity.value = quant
  //   // dayQuantityInfo['quantity'] = quant
  // }
  //
  // if (routeInfo['day_quantity']) {
  //   // controlQuantityAccess(routeDayQuantity)
  //   routeDayQuantity.value = routeInfo['day_quantity']
  // }
  //
  // shifts.value = routeInfo.need_shifts
  //
  // if (routeInfo['end_time']) {
  //   disableBtn('end-route__btn')
  //   disableBtn('pause-route__btn')
  //   endBTn.classList.add('route-type__finish')
  // }
  //
  // if (routeInfo['error_msg']) {
  //   errInput.setAttribute('disabled', '')
  //   errBtn.classList.add('route-type__error')
  //
  //   if (state['adminCheck'] || state['techCheck']) {
  //   }
  // }
  //
  // if (routeInfo['start_time']) {
  //   issuedToday.classList.add('text-input')
  //   issuedToday.removeAttribute('disabled')
  // }
  //
  // if (routeInfo['pause_time']) {
  //   pauseTimeInput.value = routeInfo['pause_time']
  //   pauseTextInput.value = routeInfo['pause_msg']
  //   pauseBtn.textContent = 'Пауза'
  //   pauseBtn.classList.add('route-type__paused')
  //   disableBtn('route__select--user')
  //
  //   if (!planObj.planStart) {
  //     disableBtn('route-plan__date')
  //   }
  //
  //   disableBtn('start-route__btn')
  //   disableBtn('start-route__time')
  //   disableBtn('issued-modal_trigger')
  //
  //
  //   disableBtn('end-route__btn')
  //   disableBtn('end-route__time')
  // }
  //
  // dayQuantityInfo = {
  //   'up': routeInfo.up || 0,
  //   'adjustment': routeInfo.adjustment || 0,
  //   'time': routeInfo.time || 0,
  //   'quantity': routeInfo.quantity || currentOrder.querySelector('input[name="quantity"]').value || 0,
  // }
}

const getTheorEndTime = (routeQuantity, routeDayQuantity, issued, startTime, theorEndInp, shifts, quantityInfo, dayInput) => {
  if (routeQuantity && routeDayQuantity) {
    shifts.value = Math.ceil(routeQuantity / routeDayQuantity)
  }

  if (routeQuantity && routeDayQuantity && startTime) {
    if (Number(routeDayQuantity) > Number(routeQuantity)) {
      routeDayQuantity = routeQuantity
      dayInput.value = routeDayQuantity
    }

    const timeInfo = {
      'quantity': Number(routeQuantity),
      'day_quantity': Number(routeDayQuantity),
      'issued': Number(issued),
      'start_time': startTime,
      'machine_start': '08:00',
      'machine_end': '20:00',
      'up': Number(quantityInfo.up),
      'adjustment': Number(quantityInfo.adjustment),
      'time': String(quantityInfo.time)
    }

    sendData(`${appAddr}/api/time/theoretic`, 'POST', JSON.stringify(timeInfo))
      .then(res => {
        return res.json()
      })
      .then(data => {
        theorEndInp.value = data.date
        shifts.value = Math.ceil(data.days)
        let checkDayInput = dayInput.value.split('/')
        if (checkDayInput.length > 1) {
          checkDayInput = checkDayInput[1]
        } else {
          checkDayInput = checkDayInput[0]
        }

        // dayInput.value = `${data.can_do[0]}/${checkDayInput}/${data.can_do[1]}`
        dayInput.value = `${data.can_do[0]}/${checkDayInput}`
        console.log(data.can_do)
        // dynEndInp.value = data.result
      })
  }
}

export const subCommentByEnter = e => {
  if (e.code === 'Enter') {
    const commentInput = document.querySelector('#section-logs__comment')
    if (commentInput && commentInput.value) {
      document.querySelector('.send__comment').click()
    }
  }
}

const createReportObj = (data) => {
  let res = data.split('---')
  res = res.map(c => c.split('    '))
  res = res.map(c => ({
    'date': c[0],
    'value': c[1]
  }))

  return res
}

export const drawPlots = (plotI, user) => {
  const plotsSelect = document.querySelector('#route__plot')
  const plotsConnection = document.querySelector('#plot-connection')
  if (plotI) {
    plotsSelect.insertAdjacentHTML('beforeend', `
      <option selected value='${plotI}'>${plotI}</option>
  `)

  }

  const plotsResp = getData('filters/get-all')

  plotsResp.then(plots => {
    plots.data = plots.data.filter(d => !d.disable)
    let check

    plots.data.forEach(plot => {
      check = String(plotI) === String(plot.name)

      if (!check) {
        plotsSelect.insertAdjacentHTML('beforeend', `
          <option value='${plot.name}'>${plot.name}</option>
       `)
      }

      plotsConnection.insertAdjacentHTML('beforeend', `
          <option ${String(plotI) === String(plot.name) ? 'selected' : ''} value='${plot.name}'>${plot.plot}</option>
      `)
    })

    // if (!check && plotI) {
    //   plotsSelect.insertAdjacentHTML('beforeend', `
    //       <option selected value='${plotI}'>${plotI}</option>
    //   `)
    //
    //   plotsConnection.insertAdjacentHTML('beforeend', `
    //       <option selected value='${plotI}'>${plotI}</option>
    //   `)
    // }

    if (plotI) {
      drawUsers(plotsConnection.querySelector('option[selected]').textContent, user, false)
    }
  })
}

export const drawUsers = (plotName, userI, change) => {
  const usersSelect = document.querySelector('#route__user')

  if (change) {
    usersSelect.querySelectorAll('option').forEach(elem => {
      elem.remove()
    })

    usersSelect.insertAdjacentHTML(`beforeend`, `
      <option selected disabled>Выберите оператора</option>
    `)

    if (userI) {
      usersSelect.insertAdjacentHTML(`beforeend`, `
        <option selected value="${userI}">${userI}</option>
      `)
    }
  }

  let check = false
  const usersResp = getData('users/get-all-operators')
  usersResp.then(users => {
    if (users.data) {
      if (plotName) {
        users.data = users.data.filter(u => u.plot === plotName)
      }

      users.data.forEach(user => {
        check = String(userI) === String(user.nickname)

        if (!check) {
          usersSelect.insertAdjacentHTML('beforeend', `
            <option value='${user.nickname}'>${user.nickname}</option>
          `)
        }
      })
    }
  })
}

const controlQuantityAccess = (routeQuantity) => {
  if (state['adminCheck'] || state['techCheck']) {
    routeQuantity.removeAttribute('readonly')
    routeQuantity.style.cursor = 'text'
  }
}

const controlCommentAccess = (commentInput) => {
  commentInput.removeAttribute('readonly')
  commentInput.removeAttribute('disabled')
  commentInput.style.cursor = 'text'
}

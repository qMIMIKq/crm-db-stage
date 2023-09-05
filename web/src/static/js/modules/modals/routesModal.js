import {showModal} from './showModal';
import {getData} from '../getData';
import {appAddr, state} from '../state';
import {user} from '../../table';
import {submitData} from "../submitOrdersData";
import {sendData} from "../sendData";
import {showResult} from "../submitControl";
import {getOrders} from "../orders";
import {getTime} from "../getTime";
import {planDateHandler} from "./planModal";
import {changeErrorHandler} from "./errorModal";
import {issuedHandler} from "./issuedModal";

const routeModal = `
   <div id='modal' class='modal modal--route bounceIn'>
<!--        <div id='close_modal'>+</div>-->
        <div class='modal_content modal_content--route'>
            <div class='modal__header modal__header--routes modal-header'>
                <div class='modal-header__db'></div>
                <div class='modal-header__number'></div>
            </div>
            <form class='route__config' method='POST'>
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
                            <label class='route__label' for='day_quantity'>Выдано</label>
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
                        
                        <div class="quantity-block">
                          <input style='cursor: default' readonly class='route__input--top route__input--small text-input progress-block__input main__input route-day__quantity' name='day_quantity' type='number' id='day_quantity' placeholder="В смену">
                          <input style='cursor: default' readonly class='route__input--top route__input--small text-input progress-block__input main__input' type='number' id='shifts' placeholder="Смен">
                        </div>
                    </div>
                </div>
               
                <div class='route__section start-route'>
                    <input 
                    readonly
                    type='text'
                    placeholder='Время начала'
                    class='route__input main__button main__input start-route__time'
                    name='start_time' 
                    disabled
                    id='start-route__time'>
                    
<!--                    onfocus='(this.type='datetime-local')'
                    onblur='(this.type='text')'-->
                    
                    <button disabled type='button' class='route__btn main__button start-route__btn'>Начал</button>
                </div>
                
                <div class='route__section end-route'>
                    <input 
                    readonly
                    type='text'
                    placeholder='Время сдачи'
                    onblur='(this.type="text")'
                    class='route__input end-route__time main__button main__input'
                    name='end_time' 
                    id='end-route__time'>
                    
                    <button disabled type='button' class='route__btn main__button end-route__btn'>Сдал</button>
                </div>
                
                <div class='route__section pause-route'>
                    <input 
                    style="cursor: default; text-align: center"
                    readonly
                    type='text'
                    placeholder='Время паузы'
                    onblur='(this.type="text")'
                    class='route__input main__input pause-route__time'
                    name='pause_time' 
                    id='pause-route__time'>
                    
                    <button disabled type='button' class='route__btn main__button pause-route__btn'>Пауза</button>
                </div>
                
                <div class='route__section error-route'>
                    <input type='text' 
                    class='route__input error__time main__input hidden__input' 
                    id='error__time' 
                    name='error_time'>
                    
                    <input 
                    type='text'
                    class='route__input hidden__input text-input main__input main__input'
                    name='error_msg' 
                    id='error-route__msg'>
                    
                    <button disabled type='button' class='route__btn route__input main__button issued-modal_trigger'>За смену</button>
                    <button disabled type='button' class='route__btn main__button error-route__btn'>Ошибка!</button>
                    <button type='button' class='route__btn main__button hidden__input error-route__close'>Сбросить ошибку</button>
                </div>
                
                <div class='route__section route__section--report section-report'>
                    <button style="align-self: flex-start" type='button' class='clickable main__button route__btn report-route__btn'>Отчет по сменам</button>
                    
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
                
                <div class='section-logs'>
                    <input 
                    class='route__comments hidden__input' 
                    id='route__comments' 
                    type='text' 
                    name='commentss'>
                    
                    <input name='comments' type="text" class="hidden__input" id="visible__comments">
                    <div class='section-logs__title'>Комментарии и логи событий</div>
                    <ul class='section-logs__list'>
                        
                    </ul>
                    <div class='section-logs__comment'>
                        <input class="hidden__input" type="text" name="last_comment" id="last_comment">
                    
                        <input
                        readonly
                        style="cursor: default"
                        class='section-logs__input main__input' 
                        placeholder='Напишите комментарий'
                        type='text' 
                        name='route-comment' 
                        id='section-logs__comment'>
                        <button disabled type='button' class='section-logs__btn main__button send__comment'>Отправить</button>
                    </div>
                </div>
                
                <div class='section-finish'>
                    <input id="route__delete" disabled class='section-finish__btn section-finish__delete main__button' type='button' value="УДАЛИТЬ">
                    
                    <div class='section-finish__complete'>
                        <button disabled class='section-finish__btn section-finish__sub main__button clickable' type='button'>ОК</button>
                    </div>
                </div>
            
            </form>
        </div>
   </div>
`
const issuedModal = `
   <div id='modal' style='z-index: 10000' class='modal modal--issued bounceIn'>
        <div class='modal_content modal_content--issued' style='width: 350px'>
            <h2 class='comment__title'>Отчет по сменам</h2>
            <ul class='comment__prev issued-list'>
            </ul>
        </div>
   </div>
`
const drawLogs = data => {
  const logsList = document.querySelector('.section-logs__list')
  const logsItems = logsList.querySelectorAll('.section-logs__item')
  if (logsItems !== null) {
    logsItems.forEach(item => {
      item.remove()
    })
  }

  data.value.split('---').reverse().forEach(log => {
    if (log.trim() !== '') {
      let flag = true

      state.systemWords.forEach(word => {
        if (log.includes(word)) {
          flag = false
        }
      })

      if (log.includes('ОШИБКА')) {
        logsList.insertAdjacentHTML(`beforeend`, `
          <li style="color: red" class='section-logs__item'>${log}</li>
        `)
      } else if (flag) {
        logsList.insertAdjacentHTML(`beforeend`, `
            <li class='section-logs__item'>${log}</li>
        `)
      } else {
        logsList.insertAdjacentHTML(`beforeend`, `
          <li style="color: #447e9b" class='section-logs__item'>${log}</li>
        `)
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

export const addLog = (name, log, selector) => {
  const today = getTime()
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
  const today = getTime()
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

const confirmChangeTimeModal = `
    <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
        <div class='modal_content modal_content--confirm' style='width: 350px'>
            <h2 class='confirm__title'>Подтвердить сброс времени?</h2>
            <div class='confirm__section'>
                <button class='main__button confirm__button confirm__button--ok'>Да</button>
                <button class='main__button confirm__button confirm__button--cncl'>Нет</button>
            </div>
        </div>
   </div>
`

const confirmChangeTimeHandler = (e, operation, alertContent) => {
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
    addLog(user.nickname, logMsg, '#visible__comments')
  })

  cncltn.addEventListener('click', () => {
    modal.click()
  })
}

export const triggerRoutesModal = e => {
  const routeInput = e.target.parentNode.querySelector('.hidden__input')
  const modalElem = showModal(routeModal)
  let logName = state['adminCheck'] || state['techCheck'] ? user.nickname : ''

  let planned = false
  let info = false
  let routeInfo = e.target.parentNode.querySelector('.hidden__input').value
  if (routeInfo !== '') {
    info = true
    routeInfo = JSON.parse(routeInfo)
  }

  const currentOrder = e.target.parentNode.parentNode.parentNode.parentNode
  const routeQuantity = modalElem.querySelector('#quantity')
  const routeDayQuantity = modalElem.querySelector('#day_quantity')
  controlQuantityAccess(routeQuantity)
  controlQuantityAccess(routeDayQuantity)

  routeQuantity.addEventListener('change', e => {
    activateOnInput(e, 'section-finish__sub')
    addLog(logName, `Установил тираж в ${e.target.value}`, '#visible__comments')
    getTheorEndTime(routeQuantity.value, routeDayQuantity.value, issued.value, startTime.value, theorEndInp, shifts)
  })

  routeDayQuantity.addEventListener('change', e => {
    activateOnInput(e, 'section-finish__sub')
    addLog(logName, `Установил дневной тираж в ${e.target.value}`, '#visible__comments')
    getTheorEndTime(routeQuantity.value, routeDayQuantity.value, issued.value, startTime.value, theorEndInp, shifts)
  })

  const routeForm = modalElem.querySelector('.route__config')
  const issued = modalElem.querySelector('#route__issued')
  const visibleLogs = document.querySelector("#visible__comments")
  const issuedToday = modalElem.querySelector('#route-issued__today')
  const startTime = document.querySelector('.start-route__time')
  const endTime = document.querySelector('.end-route__time')
  const deleteBtn = document.querySelector('#route__delete')
  const theorEndInp = document.querySelector('#route__teorend')
  const shifts = document.querySelector('#shifts')

  const pauseBtn = routeForm.querySelector('.pause-route__btn')
  const pauseTimeInput = routeForm.querySelector('.pause-route__time')
  const issuedTodayStart = document.querySelector('#route__issued-today')

  const startBtn = routeForm.querySelector('.start-route__btn')
  const endBTn = routeForm.querySelector('.end-route__btn')
  const issuedBtn = routeForm.querySelector('.issued-modal_trigger')
  const reportChanger = []

  issuedBtn.addEventListener('click', e => {
    issuedHandler(e, issued, issuedTodayStart, routePlot.value, routeUser.value, reportChanger)
  })

  // const dynEndInp = document.querySelector('#route__dynend')

  const planDateInputStart = document.querySelector('#plan_start')
  const planDateInput = document.querySelector('#route-plan__date')
  let planObj = {
    'exclude': '',
    'planStart': '',
    'planEnd': '',
    'faster': false
  }

  planDateInput.addEventListener('click', e => {
    planDateHandler(addedDates, busyDates)
  })

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

  let busyDates = []
  let dbBusyDates = []
  if (info) {
    let comments = routeInfo['comments']
    if (routeInfo['last_comment']) {
      document.querySelector('#last_comment').value = routeInfo['last_comment']
    }
    if (routeInfo.issued_today) {
      issuedTodayStart.value = Number(issuedTodayStart.value) + Number(routeInfo.issued_today)
    }

    dbAddedDates = routeInfo['db_plan'] ? routeInfo['db_plan'] : []
    dbAddedDates.map(dateInfo => {
      dateInfo['queues'] = dateInfo['queues'].split(', ')
      dateInfo['date'] = dateInfo['date'].split('T')[0]

      addedDates[dateInfo['date']] = {
        'divider': dateInfo.divider,
        'queues': dateInfo.queues
      }
    })

    dbBusyDates = routeInfo['busy_dates'] ? routeInfo['busy_dates'] : []
    dbBusyDates.map(dateInfo => {
      dateInfo['queues'] = dateInfo['queues'].split(', ')
      dateInfo['date'] = dateInfo['date'].split('T')[0]

      busyDates[dateInfo['date']] = {
        'divider': dateInfo.divider,
        'queues': dateInfo.queues
      }
    })


    planObj = {
      'exclude': routeInfo['exclude_days'],
      'planStart': routeInfo['plan_start'],
      'planEnd': routeInfo['plan_date'],
      'faster': routeInfo['plan_faster']
    }

    if (planObj.planEnd) {
      planned = true
    }

    if (routeInfo['issued']) {
      issued.value = routeInfo['issued']
    }

    if (logName !== '') {
      deleteBtn.removeAttribute('disabled')
      deleteBtn.addEventListener('click', e => {
        confirmChangeTimeHandler(e, () => {
          sendData(`${appAddr}/api/routes/delete/${routeInfo['route_id']}`, 'POST', null)
            .then(resp => {
              if (resp.ok) showResult(true)
              modalElem.remove()
              getOrders('get-all')
            })
        }, 'Удалить маршрут?')
      })
    }

    if (routeInfo['start_time']) {
      disableBtn('route__select--plot')
    }

    drawPlots(routeInfo['plot'], routeInfo['user'])
    activateNextStage('route__select--user')
    activateNextStage('pause-route__btn')

    if (!state.operCheck || routeInfo['user']) {
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
      comments = comments.filter(c => c.includes('За смену'))
      modalElem.querySelector('#issued__all').value = comments.join('---')
    }

    activateNextStage('section-finish__sub')

    if (routeInfo['quantity']) {
      routeQuantity.value = routeInfo['quantity']
      controlQuantityAccess(routeDayQuantity)
    } else {
      routeQuantity.value = currentOrder.querySelector('input[name="quantity"]').value
    }

    if (routeInfo['day_quantity']) {
      controlQuantityAccess(routeDayQuantity)
      routeDayQuantity.value = routeInfo['day_quantity']
    }

    if (routeInfo['quantity'] && routeInfo['day_quantity']) {
      shifts.value = Math.ceil(routeQuantity.value / routeDayQuantity.value)
    }

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
      pauseBtn.textContent = 'Сбросить паузу'
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

  } else {
    routeQuantity.value = currentOrder.querySelector('input[name="quantity"]').value
    drawPlots()
  }

  pauseBtn.addEventListener('click', () => {
    if (!pauseBtn.classList.contains('route-type__paused')) {
      pauseBtn.classList.add('route-type__paused')
      pauseBtn.textContent = 'Сбросить паузу'
      setDateToInput('pause-route__time')
      disableBtn('route__select--user')

      if (!planObj.planStart) {
        disableBtn('route-plan__date')
      }

      disableBtn('start-route__btn')
      disableBtn('start-route__time')
      disableBtn('issued-modal_trigger')


      disableBtn('end-route__btn')
      disableBtn('end-route__time')
      addLog(logName, `Нажал паузу`, '#visible__comments')
    } else {
      pauseBtn.classList.remove('route-type__paused')
      pauseBtn.textContent = 'Пауза'
      pauseTimeInput.value = ''
      addLog(user.nickname, `Сбросил паузу`, '#visible__comments')

      activateNextStage('route__select--user')
      activateNextStage('route-plan__date')

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
  })

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
    drawUsers(plotName, null)
    activateNextStage('route__select--user')
    activateNextStage('section-finish__sub')
    activateNextStage('pause-route__btn')
    activateNextStage('error-route__btn')
    activateNextStage('section-logs__input')
    controlQuantityAccess(routeQuantity)
    controlCommentAccess(commentInput)
  })

  const routeUser = document.querySelector('.route__select--user')
  routeUser.addEventListener('change', () => {
    addLog(logName, `Назначил оператора ${routeUser.value}`, '#visible__comments')
    activateNextStage('start-route__btn')
    activateNextStage('error-route__btn')
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

    getTheorEndTime(routeQuantity.value, routeDayQuantity.value, issued.value, startTime.value, theorEndInp, shifts)
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
    showModal(issuedModal)
    const dataPlace = document.querySelector('.issued-list')
    document.querySelector('#issued__all').value.split('---').forEach(rep => {
      if (rep.trim() !== '') {
        dataPlace.insertAdjacentHTML(`beforeend`, `
            <li style='text-align: center' class='comment__item'>${rep}</li>   
        `)
      }
    })

    addLog(logName, 'Просмотрел отчет по сменам', '#visible__comments')
  })

  window.addEventListener('keydown', subCommentByEnter)
  document.querySelector('.section-finish__sub').addEventListener('click', () => {
    const formData = new FormData(routeForm)
    const obj = {}
    formData.forEach((value, key) => {
      obj[key] = value
    })

    obj['plot'] = routeForm.querySelector('#route__plot').value
    obj['comments'] = createReportObj(obj['comments'])
    obj['error_msg'] = errInput.value
    obj['plan_date'] = planObj.planEnd
    obj['plan_start'] = planObj.planStart
    obj['plan_faster'] = planObj.faster
    obj['exclude_days'] = planObj.exclude
    obj['route_id'] = routeInfo.route_id

    console.log(obj)
    console.log(addedDates)

    let today = getTime()
    today = today.substring(0, today.length - 5)
    obj['issued_today'] = issuedTodayStart.value

    obj['planned'] = !!(dbID && planned)
    obj['report_changer'] = reportChanger
    obj['added_dates'] = addedDates
    console.log(obj.added_dates)

    routeInput.value = JSON.stringify(obj)
    const parent = routeInput.closest('.table-form--old')

    if (!(parent === null)) {
      parent.classList.remove('table-form--old')
      parent.classList.add('table-form--upd')
      sendData(`${appAddr}/api/reports/update`, 'POST', JSON.stringify(obj))
    }
    submitData()

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

const getTheorEndTime = (routeQuantity, routeDayQuantity, issued, startTime, theorEndInp, shifts) => {
  if (routeQuantity && routeDayQuantity) {
    shifts.value = Math.ceil(routeQuantity / routeDayQuantity)
  }

  if (routeQuantity && routeDayQuantity && startTime) {
    const timeInfo = {
      'quantity': Number(routeQuantity),
      'day_quantity': Number(routeDayQuantity),
      'issued': Number(issued),
      'start_time': startTime,
      'machine_start': '08:00',
      'machine_end': '20:00'
    }

    sendData(`${appAddr}/api/time/theoretic`, 'POST', JSON.stringify(timeInfo))
      .then(res => {
        return res.json()
      })
      .then(data => {
        theorEndInp.value = data.result
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
  const plotsResp = getData('filters/get-all')
  plotsResp.then(plots => {
    const plotsSelect = document.querySelector('#route__plot')
    const plotsConnection = document.querySelector('#plot-connection')

    plots.data.forEach(plot => {
      plotsSelect.insertAdjacentHTML('beforeend', `
          <option ${String(plotI) === String(plot.name) ? 'selected' : ''} value='${plot.name}'>${plot.name}</option>
      `)

      plotsConnection.insertAdjacentHTML('beforeend', `
          <option ${String(plotI) === String(plot.name) ? 'selected' : ''} value='${plot.name}'>${plot.plot}</option>
      `)
    })

    if (plotI) {
      drawUsers(plotsConnection.querySelector('option[selected]').textContent, user)
    }
  })
}

export const drawUsers = (plotName, userI) => {
  const usersSelect = document.querySelector('#route__user')
  usersSelect.querySelectorAll('option').forEach(elem => {
    elem.remove()
  })

  const usersResp = getData('users/get-all-operators')
  usersResp.then(users => {
    if (plotName) {
      users.data = users.data.filter(u => u.plot === plotName)
    }

    users.data.forEach(user => {
      usersSelect.insertAdjacentHTML('beforeend', `
          <option ${String(userI) === String(user.nickname) ? 'selected' : ''} value='${user.nickname}'>${user.nickname}</option>
      `)
    })
  })

  usersSelect.insertAdjacentHTML(`beforeend`, `
        <option selected disabled>Выберите оператора</option>
    `)
}

const controlQuantityAccess = (routeQuantity) => {
  if (state['adminCheck'] || state['techCheck']) {
    routeQuantity.removeAttribute('readonly')
    routeQuantity.style.cursor = 'text'
  }
}

const controlCommentAccess = (commentInput) => {
  commentInput.removeAttribute('readonly')
  commentInput.style.cursor = 'text'
}
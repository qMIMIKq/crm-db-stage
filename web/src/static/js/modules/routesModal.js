import {showModal} from './showModal';
import {getData} from './getData';
import {appAddr, state} from './state';
import {user} from '../table';
import {submitData} from "./submitOrdersData";
import {sendData} from "./sendData";
import {showResult} from "./submitControl";
import {getOrders} from "./orders";
import {getTime} from "./getTime";

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
                        <input class="main__button route__input--top route-plan__date" 
                            name="plan_date"
                            readonly
                            id="route-plan__date"
                            type="text"
                            placeholder="Назначить" 
                            value="" 
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
                        </div>
                        
                        <div class="quantity-block__labels">
                            <label class='route__label quantity-block__shifts' for='shifts'>Смен</label>
                            <label class='route__label quantity-block__inshifts' for='day_quantity'>В смену</label>
                        </div>
                        <div class="quantity-block">
                          <input style='cursor: default' readonly class='route__input--top route__input--small text-input progress-block__input main__input' type='number' id='shifts' placeholder="Смен">
                          <input style='cursor: default' readonly class='route__input--top route__input--small text-input progress-block__input main__input route-day__quantity' name='day_quantity' type='number' id='day_quantity' placeholder="В смену">
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
                
                <div class='route__section otk-route'>
                    <input 
                    readonly
                    type='text'
                    placeholder='Время ОТК'
                    onblur='(this.type="text")'
                    class='route__input main__button main__input otk-route__time'
                    name='otk_time' 
                    id='otk-route__time'>
                    
                    <button disabled type='button' class='route__btn main__button otk-route__btn'>ОТК</button>
                </div>
                
                <div class='route__section error-route'>
                    <input type='text' 
                    class='route__input error__time main__input hidden__input' 
                    id='error__time' 
                    name='error_time'>
                    
                    <input 
                    type='text'
                    placeholder='Описание ошибки!'
                    class='route__input text-input main__input main__input'
                    name='error_msg' 
                    id='error-route__msg'>
                    
                    <button disabled type='button' class='route__btn main__button error-route__btn'>Ошибка!</button>
                    <button type='button' class='route__btn main__button hidden__input error-route__close'>Сбросить ошибку</button>
                </div>
                
                <div class='route__section route__section--report section-report'>
                    <button type='button' class='clickable main__button route__btn report-route__btn'>Отчет по сменам</button>
                    
                    <div class='section-report__issued'>
                        <input 
                        type='text' 
                        class='hidden__input' 
                        id='issued_report'
                        name='issued_report'>
                        
                        <input type='text'
                        class='hidden__input'
                        id='issued__all'>
                        
                        <input
                        disabled
                        id='route-issued__today'
                        name='issued_today'
                        placeholder='За смену'
                        class='route__input main__button main__input issued-route__num' 
                        type='number'>
                       <button disabled type='button' class='route__btn main__button report-sub--route__btn'>ОК</button>
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
                        <button disabled class='section-finish__btn section-finish__cancel main__button clickable' type='button'>ОТМЕНА</button>
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
  const systemWords = ['Начал', 'Установил', 'Назначил', 'Выбрал', 'Закончил', 'Прошел', 'Сбросил', 'За смену', 'Просмотрел', 'Поставил маршрут']

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

      systemWords.forEach(word => {
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

const addLog = (name, log, selector) => {
  const today = getTime()
  let logMsg = `${today}    ${name} ${log}`
  const visible = saveData(logMsg, selector)
  saveData(logMsg, '#route__comments')
  drawLogs(visible)
  return logMsg
}

const activateOnInput = (e, cls) => {
  if (e.target.value !== '') {
    activateNextStage(cls)
  } else {
    disableBtn(cls)
  }
}

const setDateToInput = inputId => {
  const today = getTime()
  const timeInput = document.querySelector('#' + inputId)
  timeInput.value = today
}

const activateNextStage = btnClass => {
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
      case 'otk_time':
        logMsg = 'Сбросил время ОТК'
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

const planDateModal = `
    <div id='modal' style='z-index: 10000' class='modal modal-plan__date bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 400px'>
        <h2 class='confirm__title confirm__title--plan'>Назначить этап в план</h2>
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">В план</label>
                <input type="date" class="main__button modal-plan__end">
            </div>
            <div class="modal-plan__check">
                <label>Срочно</label>
                <input type="checkbox" class="modal-plan__urgently"> 
            </div>
        </div>
        
        <h2 class="confirm__title confirm__title--plan">Удалить этап из плана</h2>
        <div class="modal-plan__section">
            <ul class="modal-plan__exclude">
            </ul>
            <input type="date" class="main__button modal-plan__exclude-chose">
        </div>
        
        <div class='confirm__section'>
            <button class='main__button confirm__button confirm__button--ok'>Да</button>
            <button class='main__button confirm__button confirm__button--cncl'>Нет</button>
        </div>
      </div>
   </div>
`

const planDateHandler = (e, planObj, dateEndInput) => {
  const modal = showModal(planDateModal)
  const dateInput = modal.querySelector('.modal-plan__end')
  const dateUrgently = modal.querySelector('.modal-plan__urgently')
  const excludeSelect = modal.querySelector('.modal-plan__exclude')
  const excludeDateChose = modal.querySelector('.modal-plan__exclude-chose')

  let today = getTime()
  today = today.substring(0, today.length - 6)
  let tmrw = new Date(today)
  tmrw.setDate(tmrw.getDate() + 1)
  tmrw = tmrw.toLocaleString().split(", ")[0].split('/')
  ;[tmrw[0], tmrw[2]] = [tmrw[2], tmrw[0]]
  tmrw = tmrw.join('-')

  const getDays = (start, end) => {
    const oneDay = 1000 * 60 * 60 * 24
    let diff = end.getTime() - start.getTime()

    return Math.round(diff / oneDay)
  }

  let exclude = []
  if (planObj.planEnd) {
    dateInput.value = planObj.planEnd
    exclude = planObj.exclude ? planObj.exclude.split('__') : []
    const endDate = new Date(dateInput.value)
    const startDate = new Date(planObj.planStart)

    excludeDateChose.setAttribute('min', today)
    if (planObj.faster) {
      dateUrgently.setAttribute('checked', '')
    }

    if (startDate.getTime() < new Date(today).getTime()) {
      dateUrgently.setAttribute('disabled', '')
    }

    drawData(startDate, endDate)
    excludeSelect.insertAdjacentHTML('afterbegin', `
        <li class="modal-plan__exclude-option ${exclude.includes(planObj.planStart) ? 'exclude-date' : 'include-date'}">${planObj.planStart}</li>  
    `)
    addHandler()
  } else {
    dateInput.setAttribute('min', tmrw)
  }

  function addHandler() {
    modal.querySelectorAll('.modal-plan__exclude-option').forEach(option => {
      option.addEventListener('click', () => {
        option.classList.toggle('exclude-date')
        option.classList.toggle('include-date')

        if (option.classList.contains('exclude-date')) {
          exclude.push(option.textContent)
        } else {
          exclude = exclude.filter(ex => ex !== option.textContent)
        }
      })
    })
  }

  function drawData(startDate, endDate) {
    let res = getDays(startDate, endDate)
    for (let i = res + 1; i > 2; i--) {
      endDate.setDate(endDate.getDate() - 1)
      let date = endDate.toISOString().split('T')[0]

      excludeSelect.insertAdjacentHTML('afterbegin', `
        <li class="modal-plan__exclude-option ${exclude.includes(date) ? 'exclude-date' : 'include-date'}">${date}</li>  
      `)
    }

    excludeDateChose.setAttribute('max', dateInput.value)
    excludeSelect.insertAdjacentHTML('beforeend', `
        <li class="modal-plan__exclude-option ${exclude.includes(dateInput.value) ? 'exclude-date' : 'include-date'}">${dateInput.value}</li>  
    `)
  }

  if (dateInput.value) {
    excludeDateChose.removeAttribute('disabled')
  } else {
    excludeDateChose.setAttribute('disabled', '')
  }

  dateInput.addEventListener('change', e => {
    excludeDateChose.removeAttribute('disabled')
    const endDate = new Date(dateInput.value)
    const startDate = new Date(today)

    excludeSelect.querySelectorAll('li').forEach(date => {
      date.remove()
    })

    drawData(startDate, endDate)

    if (dateUrgently.checked) {
      excludeSelect.insertAdjacentHTML('afterbegin', `
        <li class="modal-plan__exclude-option ${exclude.includes(today) ? 'exclude-date' : 'include-date'}">${today}</li>  
      `)
      excludeDateChose.setAttribute('min', today)
    } else {
      excludeDateChose.setAttribute('min', excludeSelect.querySelector('li').textContent)
    }

    addHandler()
  })

  dateUrgently.addEventListener('change', e => {
    if (dateUrgently.checked) {
      excludeSelect.insertAdjacentHTML('afterbegin', `
        <li class="modal-plan__exclude-option include-date">${today}</li>  
      `)

      excludeSelect.querySelector('li').addEventListener('click', e => {
        e.target.classList.toggle('exclude-date')
        e.target.classList.toggle('include-date')

        if (e.target.classList.contains('exclude-date')) {
          exclude.push(e.target.textContent)
        } else {
          exclude = exclude.filter(ex => ex !== e.target.textContent)
        }
      })

      excludeDateChose.setAttribute('min', today)
    } else {
      excludeSelect.querySelector('li').remove()
      excludeDateChose.setAttribute('min', excludeSelect.querySelector('li').textContent)
    }
  })

  excludeDateChose.addEventListener('change', () => {
    excludeSelect.querySelectorAll('li').forEach(date => {
      if (date.textContent === excludeDateChose.value) {
        date.classList.add('exclude-date')
      }
    })

    excludeDateChose.value = ''
  })

  const okBtn = modal.querySelector('.confirm__button--ok')
  const cnclBtn = modal.querySelector('.confirm__button--cncl')

  okBtn.addEventListener('click', () => {
    planObj.exclude = exclude.join('__')
    planObj.planStart = excludeSelect.querySelector('li').textContent
    planObj.planEnd = dateInput.value
    planObj.faster = dateUrgently.checked

    dateEndInput.value = planObj.planEnd
    modal.click()
  })

  cnclBtn.addEventListener('click', () => modal.click())
}

export const triggerRoutesModal = e => {
  const routeInput = e.target.parentNode.querySelector('.hidden__input')
  const modalElem = showModal(routeModal)
  let logName = state['adminCheck'] || state['techCheck'] ? user.nickname : ''

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


  const issued = modalElem.querySelector('#route__issued')
  const visibleLogs = document.querySelector("#visible__comments")
  const issuedToday = modalElem.querySelector('#route-issued__today')
  const reportBtn = modalElem.querySelector('.report-sub--route__btn')
  const startTime = document.querySelector('.start-route__time')
  const endTime = document.querySelector('.end-route__time')
  const deleteBtn = document.querySelector('#route__delete')
  const theorEndInp = document.querySelector('#route__teorend')
  const shifts = document.querySelector('#shifts')

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
    planDateHandler(e, planObj, planDateInput)
  })

  const errInput = document.querySelector('#error-route__msg')
  errInput.addEventListener('input', e => {
    activateOnInput(e, 'error-route__btn')
  })

  const errTime = document.querySelector('.error__time')
  const errTimeHandler = () => {
    errTime.classList.add('hidden__input')
    errInput.classList.remove('hidden__input')
  }
  const errInputHandler = () => {
    errInput.classList.add('hidden__input')
    errTime.classList.remove('hidden__input')
  }

  const routeForm = modalElem.querySelector('.route__config')

  const errBtn = routeForm.querySelector('.error-route__btn')
  errBtn.addEventListener('click', () => {
    let logMsg = `ОШИБКА ${document.querySelector('#error-route__msg').value}`

    addLog(logName, logMsg, '#visible__comments')
    setDateToInput('error__time')
    activateNextStage('error__time')
    errInput.classList.remove('text-input')
    errInput.classList.add('clickable')
    errBtn.classList.add('hidden__input')
    errCloseBtn.classList.remove('hidden__input')
    activateNextStage('error-route__close')
    disableBtn('error-route__btn')
    errInput.setAttribute('disabled', '')
  })

  const errCloseBtn = document.querySelector('.error-route__close')
  errCloseBtn.addEventListener('click', e => {
    errTime.removeEventListener('focus', errTimeHandler)
    errTime.value = ''
    errTime.classList.add('hidden___input')
    errInput.removeEventListener('focus', errInputHandler)
    errInput.value = ''
    errInput.classList.remove('hidden___input')
    errInput.classList.remove('clickable')
    errInput.classList.add('text-input')
    errInput.removeAttribute('disabled')
    errCloseBtn.classList.add('hidden__input')
    errBtn.classList.remove('hidden__input')
    disableBtn('error-route__close')
    addLog(logName, 'Сбросил ошибку', '#visible__comments')
  })


  if (state['adminCheck'] || state['techCheck']) {
    activateNextStage('start-route__time')
    activateNextStage('route__select--plot')
    planDateInput.removeAttribute('disabled')

    startTime.addEventListener('click', e => {
      confirmChangeTimeHandler(e, () => {
        activateNextStage('start-route__btn')
        endTime.value = ''
        document.querySelector('#otk-route__time').value = ''
        disableBtn('end-route__btn')
        disableBtn('otk-route__btn')
      })
    })

    endTime.addEventListener('click', e => {
      confirmChangeTimeHandler(e, () => {
        activateNextStage('end-route__btn')
        disableBtn('otk-route__btn')
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

    addLog(name, `${document.querySelector('#section-logs__comment').value}`, '#visible__comments')
    document.querySelector('#section-logs__comment').value = ''
    disableBtn('send__comment')
  })

  if (info) {
    const id = routeInfo['route_id']
    const quantity = routeInfo['quantity']
    const dayQuantity = routeInfo['day_quantity']
    const plot = routeInfo['plot']
    const user = routeInfo['user']
    const start = routeInfo['start_time']
    const end = routeInfo['end_time']
    const otk = routeInfo['otk_time']
    const errT = routeInfo['error_time']
    const errM = routeInfo['error_msg']
    const theorEnd = routeInfo['theor_end']
    // const dynEnd = routeInfo['dyn_end']
    const planDate = routeInfo['plan_date']
    const planDateStart = routeInfo['plan_start']
    const excludeDays = routeInfo['exclude_days']
    const faster = routeInfo['plan_faster']
    let comments = routeInfo['comments']

    planObj = {
      'exclude': excludeDays,
      'planStart': planDateStart,
      'planEnd': planDate,
      'faster': faster
    }

    if (routeInfo['issued']) {
      issued.value = routeInfo['issued']
    }

    if (logName !== '') {
      deleteBtn.removeAttribute('disabled')
      deleteBtn.addEventListener('click', e => {
        confirmChangeTimeHandler(e, () => {
          sendData(`${appAddr}/api/routes/delete/${id}`, 'POST', null)
            .then(resp => {
              if (resp.ok) showResult(true)
              modalElem.remove()
              getOrders('get-all')
            })
        }, 'Удалить маршрут?')
      })
    }

    if (start) {
      disableBtn('route__select--plot')
    }

    drawPlots(plot, user)
    activateNextStage('route__select--user')

    if (logName !== '') {
      controlCommentAccess(commentInput)
    }

    if (user) {
      controlCommentAccess(commentInput)
    }

    if (!start) {
      activateNextStage('start-route__btn')
    } else {
      activateNextStage('end-route__btn')
    }

    startTime.value = start
    document.querySelector('#end-route__time').value = end
    document.querySelector('#otk-route__time').value = otk
    document.querySelector('#error-route__msg').value = errM
    document.querySelector('#error__time').value = errT

    theorEndInp.value = theorEnd ? theorEnd : ''
    // dynEndInp.value = dynEnd ? dynEnd : ''
    planDateInput.value = planDate ? planDate : ''
    planDateInputStart.value = planDateStart ? planDateStart : ''

    if (comments) {
      comments = comments.map(c => `${c['date']}    ${c['value']}`)
      comments = comments.join('---')
      visibleLogs.value = comments

      comments = comments.split('---')
      comments = comments.filter(c => c.includes('За смену'))
      modalElem.querySelector('#issued__all').value = comments.join('---')
    }

    activateNextStage('section-finish__sub')
    activateNextStage('section-finish__cancel')

    if (quantity) {
      routeQuantity.value = quantity
      controlQuantityAccess(routeDayQuantity)
    } else {
      routeQuantity.value = currentOrder.querySelector('input[name="quantity"]').value
    }

    if (dayQuantity) {
      controlQuantityAccess(routeDayQuantity)
      routeDayQuantity.value = dayQuantity
    }

    if (quantity && dayQuantity) {
      shifts.value = Math.ceil(routeQuantity.value / routeDayQuantity.value)
    }

    if (end) {
      disableBtn('end-route__btn')

      if (state['adminCheck'] || state['techCheck']) {
        activateNextStage('otk-route__btn')
      }
    }

    if (errM) {
      errInput.classList.remove('hidden__input')
      errTime.classList.add('hidden__input')
      errInput.setAttribute('disabled', '')

      if (state['adminCheck'] || state['techCheck']) {
        errCloseBtn.classList.remove('hidden__input')
        errBtn.classList.add('hidden__input')
      }
    }

    if (start) {
      issuedToday.classList.add('text-input')
      issuedToday.removeAttribute('disabled')
    }
  } else {
    routeQuantity.value = currentOrder.querySelector('input[name="quantity"]').value
    drawPlots()
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
    drawUsers(plotName, null)
    activateNextStage('section-finish__sub')
    controlQuantityAccess(routeQuantity)
    controlCommentAccess(commentInput)
  })

  const routeUser = document.querySelector('.route__select--user')
  routeUser.addEventListener('change', () => {
    addLog(logName, `Назначил оператора ${routeUser.value}`, '#visible__comments')
    activateNextStage('start-route__btn')
  })

  drawLogs(visibleLogs)
  const startBtn = routeForm.querySelector('.start-route__btn')
  startBtn.addEventListener('click', () => {
    setDateToInput('start-route__time')
    activateNextStage('end-route__btn')
    activateNextStage('section-finish__sub')
    activateNextStage('section-finish__cancel')
    disableBtn('start-route__btn')
    disableBtn('route__select--plot')
    addLog(routeUser.value, 'Начал', '#visible__comments')
    issuedToday.classList.add('text-input')
    issuedToday.removeAttribute('disabled')

    getTheorEndTime(routeQuantity.value, routeDayQuantity.value, issued.value, startTime.value, theorEndInp, shifts)
  })

  // END
  const endBTn = routeForm.querySelector('.end-route__btn')
  endBTn.addEventListener('click', () => {
    setDateToInput('end-route__time')
    if (state['adminCheck'] || state['techCheck']) {
      activateNextStage('otk-route__btn')
    }
    disableBtn('end-route__btn')
    addLog(routeUser.value, 'Закончил', '#visible__comments')
  })

  // OTK
  const otkBtn = routeForm.querySelector('.otk-route__btn')
  otkBtn.addEventListener('click', () => {
    setDateToInput('otk-route__time')
    disableBtn('otk-route__btn')
    addLog(routeUser.value, 'Прошел ОТК', '#visible__comments')
  })

  // REPORT
  reportBtn.addEventListener('click', () => {
    issued.value = String(Number(issued.value) + Number(issuedToday.value))
    let logMsg = addLog(routeUser.value, `${routePlot.value} За смену ${issuedToday.value}`, '#visible__comments')
    saveData(logMsg, '#issued_report')
    issuedToday.value = ''
  })

  issuedToday.addEventListener('input', e => {
    activateOnInput(e, 'report-sub--route__btn')
  })
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

    routeInput.value = JSON.stringify(obj)
    const parent = routeInput.closest('.table-form--old')

    if (!(parent === null)) {
      parent.classList.remove('table-form--old')
      parent.classList.add('table-form--upd')
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

const drawPlots = (plotI, user) => {
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

const drawUsers = (plotName, userI) => {
  const usersSelect = document.querySelector('#route__user')
  usersSelect.querySelectorAll('option').forEach(elem => {
    // if (!elem.hasAttribute('disabled'))
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

  // if (userI) {
  //     usersSelect.querySelector('option[disabled]').remove()
  // }

  activateNextStage('route__select--user')
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

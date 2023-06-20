import {showModal} from './showModal';
import {getData} from './getData';
import {state} from './state';
import {drawSubmit} from './submitControl';
import {user} from '../table';
import {submitData} from "./submitOrdersData";

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
                        <select disabled class='clickable route__select main__button main__select route__select--plot' name='plot' id='route__plot'>
                            <option selected disabled>Выберите участок</option>
                        </select>
                        
                        <select disabled class='hidden__input' id='plot-connection'>
                        </select>
                        
                        <label class='route__label' for='route__user'>Оператор</label>
                        <select disabled class='route__select main__button main__select route__select--user' name='user' id='route__user'>
                            <option selected disabled>Выберите оператора</option>
                        </select>
                    </div>      
                    <div class='route__block progress-block'>
                        <label class='route__label' for='route__quantity'>Тираж</label>
                        <input style='cursor: default' readonly class='text-input progress-block__input main__input' name='quantity' type='number' id='quantity'>
                        <label class='route__label' for='route__issued'>Выдано</label>
                        <input readonly class='table__data--ro main__input progress-block__input' type='number' name='issued' id='route__issued'>
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
                    onblur=''(this.type='text')'
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
                    onblur=''(this.type='text')'
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
                    name='comments'>
                    <div class='section-logs__title'>Комментарии и логи событий</div>
                    <ul class='section-logs__list'>
                        
                    </ul>
                    <div class='section-logs__comment'>
                        <input
                        class='section-logs__input main__input' 
                        placeholder='Напишите комментарий'
                        type='text' 
                        name='route-comment' 
                        id='section-logs__comment'>
                        <button disabled type='button' class='section-logs__btn main__button send__comment'>Отправить</button>
                    </div>
                </div>
                
                <div class='section-finish'>
                    <button disabled class='section-finish__btn section-finish__delete main__button clickable' type='button'>УДАЛИТЬ</button>
                    
                    <div class='section-finish__complete'>
                        <button disabled class='section-finish__btn section-finish__cancel main__button clickable' type='button'>ОТМЕНА</button>
                        <button disabled class='section-finish__btn section-finish__sub main__button clickable' type='submit'>ОК</button>
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
            logsList.insertAdjacentHTML(`beforeend`, `
                <li class='section-logs__item'>${log}</li>
            `)
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
    let today = new Date(Date.now()).toISOString()
    today = today.substring(0, today.length - 8)
    let logMsg = `${today}    ${name} ${log}`
    const dataInput = saveData(logMsg, selector)
    drawLogs(dataInput)
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
    let today = new Date(Date.now()).toISOString()
    today = today.substring(0, today.length - 8)
    const timeInput = document.querySelector('#' + inputId)
    timeInput.setAttribute('type', 'datetime-local')
    timeInput.value = today
    timeInput.setAttribute('type', 'text')
}
const activateNextStage = btnClass => {
    const btn = document.querySelector('.' + btnClass)
    btn.removeAttribute('disabled')
    btn.classList.add('clickable')
}
const disableBtn = btnClass => {
    const btn = document.querySelector('.' + btnClass)
    btn.setAttribute('disabled', 'true')
    btn.classList.remove('clickable')
}

export const showRoutesIssued = e => {
    const parent = e.target.parentNode.parentNode
    parent.querySelectorAll('.table__data').forEach(label => {
        if (!label.classList.contains('tr')) {
            label.classList.toggle('table__data--opened')
        }
    })
    const routeIssued = parent.querySelector('.table-routes__issued')
    routeIssued.classList.toggle('hidden__input')
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

const confirmChangeTimeHandler = (e, operation) => {
    showModal(confirmChangeTimeModal)

    const modal = document.querySelector('.modal--confirm')
    const okBtn = modal.querySelector('.confirm__button--ok')
    const cncltn = modal.querySelector('.confirm__button--cncl')

    okBtn.addEventListener('click', () => {
        e.target.value = ''
        operation()
        modal.click()
    })

    cncltn.addEventListener('click', () => {
        modal.click()
    })
}

export const triggerRoutesModal = e => {
    const routeInput = e.target.parentNode.querySelector('.hidden__input')
    state['currentRoute'] = routeInput['name']

    const modalElem = showModal(routeModal)

    let info = false
    let routeInfo = e.target.parentNode.querySelector('.hidden__input').value
    if (routeInfo !== '') {
        info = true
        routeInfo = JSON.parse(routeInfo)
    }

    const currentOrder = e.target.parentNode.parentNode.parentNode.parentNode
    const modQ = modalElem.querySelector('#quantity')
    modQ.addEventListener('input', e => {
        activateOnInput(e, 'section-finish__sub')
    })
    const issued = modalElem.querySelector('#route__issued')
    const logsData = document.querySelector('#route__comments')
    const issuedToday = modalElem.querySelector('#route-issued__today')
    const reportBtn = modalElem.querySelector('.report-sub--route__btn')
    const startTime = document.querySelector('.start-route__time')
    const endTime = document.querySelector('.end-route__time')

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
        let name = ''
        if (state['adminCheck'] || state['techCheck']) {
            name = user.name
        }
        let logMsg = 'ОШИБКА ' + document.querySelector('#error-route__msg').value

        addLog(name, logMsg, '#route__comments')
        setDateToInput('error__time')
        activateNextStage('error__time')
        // errInput.classList.add('hidden__input')
        // errTime.classList.remove('hidden__input')
        // errTime.addEventListener('focus', errTimeHandler)
        errInput.classList.remove('text-input')
        errInput.classList.add('clickable')
        errInput.addEventListener('focus', errInputHandler)
        errBtn.classList.add('hidden__input')
        errCloseBtn.classList.remove('hidden__input')
        activateNextStage('error-route__close')
        disableBtn('error-route__btn')
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
        errCloseBtn.classList.add('hidden__input')
        errBtn.classList.remove('hidden__input')
        disableBtn('error-route__close')
    })


    if (state['adminCheck'] || state['techCheck']) {
        activateNextStage('start-route__time')
        activateNextStage('route__select--plot')
        modQ.removeAttribute('readonly')
        modQ.style.cursor = 'text'

        startTime.addEventListener('click', e => {
            confirmChangeTimeHandler(e, () => {
                activateNextStage('start-route__btn')
                endTime.value = ''
                disableBtn('end-route__btn')
            })
        })

        endTime.addEventListener('click', e => {
            confirmChangeTimeHandler(e, () => {
                activateNextStage('end-route__btn')
                disableBtn('otk-route__btn')
            })
        })
    }

    if (info) {
        const quantity = routeInfo['quantity']
        issued.value = routeInfo['issued']
        const plot = routeInfo['plot']
        const user = routeInfo['user']
        const start = routeInfo['start_time']
        const end = routeInfo['end_time']
        const otk = routeInfo['otk_time']
        const errT = routeInfo['error_time']
        const errM = routeInfo['error_msg']
        let comments = routeInfo['comments']

        drawPlots(plot)
        drawUsers(null, user)
        activateNextStage('route__select--user')
        activateNextStage('route__select--user')
        disableBtn('route__select--plot')

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

        if (comments) {
            comments = comments.map(c => `${c['date']}    ${c['value']}`)
            comments = comments.join('---')
            logsData.value = comments

            comments = comments.split('---')
            comments = comments.filter(c => c.includes('За смену'))
            modalElem.querySelector('#issued__all').value = comments.join('---')
        }

        console.log(issued.value)

        activateNextStage('section-finish__sub')
        activateNextStage('section-finish__cancel')

        if (quantity) {
            modQ.value = quantity
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

            if (state['adminCheck'] || state['techCheck']) {
                errCloseBtn.classList.remove('hidden__input')
                errBtn.classList.add('hidden__input')
            }
        }

        issuedToday.classList.add('text-input')
        issuedToday.removeAttribute('disabled')
    } else {
        modQ.value = currentOrder.querySelector('input[name="quantity"]').value
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

        drawUsers(plotName, null)
    })
    const routeUser = document.querySelector('.route__select--user')
    routeUser.addEventListener('change', () => {
        activateNextStage('start-route__btn')
        activateNextStage('section-finish__sub')
    })
    drawLogs(logsData)
    const startBtn = routeForm.querySelector('.start-route__btn')
    startBtn.addEventListener('click', () => {
        setDateToInput('start-route__time')
        activateNextStage('end-route__btn')
        activateNextStage('section-finish__sub')
        activateNextStage('section-finish__cancel')
        disableBtn('start-route__btn')
        disableBtn('route__select--plot')
        addLog(routeUser.value, '"Начал"', '#route__comments')
        issuedToday.classList.add('text-input')
        issuedToday.removeAttribute('disabled')
    })
    const endBTn = routeForm.querySelector('.end-route__btn')
    endBTn.addEventListener('click', () => {
        setDateToInput('end-route__time')
        if (state['adminCheck'] || state['techCheck']) {
            activateNextStage('otk-route__btn')
        }
        disableBtn('end-route__btn')
        addLog(routeUser.value, '"Закончил"', '#route__comments')
    })
    const otkBtn = routeForm.querySelector('.otk-route__btn')
    otkBtn.addEventListener('click', () => {
        setDateToInput('otk-route__time')
        disableBtn('otk-route__btn')
        addLog(routeUser.value, 'Прошел ОТК', '#route__comments')
    })

    reportBtn.addEventListener('click', () => {
        issued.value = String(Number(issued.value) + Number(issuedToday.value))
        let logMsg = addLog(routeUser.value, `"За смену ${issuedToday.value}"`, '#route__comments')
        saveData(logMsg, '#issued_report')
        issuedToday.value = ''
    })

    issuedToday.addEventListener('input', e => {
        activateOnInput(e, 'report-sub--route__btn')
    })
    const commentInput = document.querySelector('#section-logs__comment')
    commentInput.addEventListener('input', e => {
        activateOnInput(e, 'send__comment')
    })
    const commentBtn = document.querySelector('.send__comment')
    commentBtn.addEventListener('click', () => {
        let name = state['adminCheck'] || state['techCheck'] ? user.name : routeUser.value !== 'Выберите оператора' ? routeUser.value : 'Выберите оператора'
        addLog(name, `'${document.querySelector('#section-logs__comment').value}'`, '#route__comments')
        document.querySelector('#section-logs__comment').value = ''
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
    })

    routeForm.addEventListener('submit', e => {
        e.preventDefault()
        const formData = new FormData(routeForm)
        const obj = {}
        formData.forEach((value, key) => {
            obj[key] = value
        })
        obj['plot'] = e.target.querySelector('#route__plot').value

        obj['comments'] = createReportObj(obj['comments'])
        obj['issued_report'] = createReportObj(obj['issued_report'])
        routeInput.value = JSON.stringify(obj)

        console.log(obj)
        const parent = routeInput.closest('.table-form--old')

        if (!(parent === null)) {
            parent.classList.remove('table-form--old')
            parent.classList.add('table-form--upd')
        }

        submitData()
        document.querySelector('.modal--route').remove()
    })
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

const drawPlots = async (plotI) => {
    const plotsResp = getData('filters/get-all')
    plotsResp.then(plots => {
        const plotsSelect = document.querySelector('#route__plot')
        const plotsConnection = document.querySelector('#plot-connection')

        plots.data.forEach(plot => {
            plotsSelect.insertAdjacentHTML('beforeend', `
                <option ${String(plotI) === String(plot.name) ? 'selected' : ''} value='${plot.name}'>${plot.name.toUpperCase()}</option>
            `)

            plotsConnection.insertAdjacentHTML('beforeend', `
                <option value='${plot.name}'>${plot.plot}</option>
            `)
        })
    })
}

const drawUsers = (plotName, userI) => {
    const usersSelect = document.querySelector('#route__user')
    usersSelect.querySelectorAll('option').forEach(elem => {
        if (!elem.hasAttribute('disabled')) elem.remove()
    })

    const usersResp = getData('users/get-all-operators')
    usersResp.then(users => {
        if (plotName) {
            users.data = users.data.filter(u => u.plot === plotName)
        }

        users.data.forEach(user => {
            usersSelect.insertAdjacentHTML('beforeend', `
                <option ${String(userI) === String(user.name) ? 'selected' : ''} value='${user.name}'>${user.name}</option>
            `)
        })

        activateNextStage('route__select--user')
    })
}
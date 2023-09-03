import {showModal} from "./showModal";
import {getTime} from "../getTime";

const planDateModal = `
    <div id='modal' style='z-index: 10000' class='modal modal-plan__date bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 400px'>
        <h2 class='confirm__title confirm__title--plan'>Назначить этап в план</h2>
         <div class="modal-plan__section">
            <div class="modal-plan__data modal-plan__data--center">
<!--                <label class="modal-plan__label">Текущая дата</label>-->
                <input type="text" class="main__button modal-plan__today">
            </div>
        </div>
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">В плане от</label>
                <input type="date" class="main__button modal-plan__start">
            </div>
        </div>
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">В плане до </label>
                <input type="date" class="main__button modal-plan__end">
            </div>
        </div>
        <h2 class="confirm__title confirm__title--plan">Удалить этап из плана</h2>
        <div class="modal-plan__section">
            <ul class="modal-plan__exclude">
            </ul>
            <input type="date" class="main__button modal-plan__exclude-chose">
        </div>
        
        <div class='confirm__section'>
            <button class='main__button confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button confirm__button confirm__button--cncl'>Отмена</button>
        </div>
      </div>
   </div>
`

export const planDateHandler = (e, planObj, dateEndInput) => {
  const modal = showModal(planDateModal)
  const dateInput = modal.querySelector('.modal-plan__today')
  const dateStart = modal.querySelector('.modal-plan__start')
  const dateEnd = modal.querySelector('.modal-plan__end')
  const excludeSelect = modal.querySelector('.modal-plan__exclude')
  const excludeDateChose = modal.querySelector('.modal-plan__exclude-chose')

  const notInPlan = !(!!dateStart.value)

  let today = getTime()
  today = today.substring(0, today.length - 5).trim()
  let tmrw = new Date(today)
  tmrw.setDate(tmrw.getDate() + 1)
  tmrw = tmrw.toISOString().split('T')[0]
  console.log(tmrw)

  dateInput.value = today

  dateStart.setAttribute('min', today)
  excludeDateChose.setAttribute('min', today)

  const getDays = (start, end) => {
    const oneDay = 1000 * 60 * 60 * 24
    let diff = end.getTime() - start.getTime()
    console.log(start, end)

    return Math.round(diff / oneDay)
  }

  let exclude = []
  if (planObj.planEnd) {
    dateStart.value = planObj.planStart
    dateEnd.value = planObj.planEnd
    exclude = planObj.exclude ? planObj.exclude.split('__') : []
    const startDate = new Date(dateStart.value)
    let endDate = new Date(dateEnd.value)
    endDate.setDate(endDate.getDate() + 1)

    drawData(startDate, endDate)
    addHandler()
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
    console.log(res)

    for (let i = res + 1; i > 1; i--) {
      endDate.setDate(endDate.getDate() - 1)
      let date = endDate.toISOString().split('T')[0]
      if (exclude.includes(date)) continue

      excludeSelect.insertAdjacentHTML('afterbegin', `
        <li class="modal-plan__exclude-option ${exclude.includes(date) ? 'exclude-date' : 'include-date'}">${date}</li>  
      `)
    }

    excludeDateChose.setAttribute('max', dateEnd.value)
  }

  if (dateStart.value) {
    excludeDateChose.removeAttribute('disabled')
  } else {
    excludeDateChose.setAttribute('disabled', '')
  }

  dateStart.addEventListener('change', e => {
    dateEnd.value = dateStart.value
    dateEnd.setAttribute('min', dateStart.value)

    exclude = []
    excludeDateChose.removeAttribute('disabled')
    const startDate = new Date(dateStart.value)
    let endDate = new Date(dateEnd.value)
    endDate.setDate(endDate.getDate() + 1)

    excludeSelect.querySelectorAll('li').forEach(date => {
      date.remove()
    })

    drawData(startDate, endDate)
    addHandler()
  })

  dateEnd.addEventListener('change', e => {
    exclude = []
    excludeDateChose.removeAttribute('disabled')
    const startDate = new Date(dateStart.value)
    let endDate = new Date(dateEnd.value)
    endDate.setDate(endDate.getDate() + 1)

    excludeSelect.querySelectorAll('li').forEach(date => {
      date.remove()
    })

    drawData(startDate, endDate)
    addHandler()
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
    let maxDay
    excludeSelect.querySelectorAll('.include-date').forEach(day => {
      maxDay = day.textContent
    })

    let minDay = excludeSelect.querySelector('.include-date')
    if (minDay) {
      minDay = minDay.textContent
    }

    planObj.exclude = exclude.join('__')
    planObj.planStart = minDay
    planObj.planEnd = maxDay

    if (maxDay) {
      dateEndInput.value = maxDay
    } else {
      dateEndInput.value = ''
      dateEndInput.classList.remove('route-type__finish')
    }

    console.log(planObj)

    modal.click()
  })

  cnclBtn.addEventListener('click', () => modal.click())
}

const planDateModal2 = `
    <div id='modal' style='z-index: 10000' class='modal modal-plan__date bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 404px'>
        <h2 class='confirm__title confirm__title--plan'>Период</h2>
        <input type="text" class="hidden__input" name="end_date" id="end_date">
        <div class="modal-plan__period plan-period">
            <button class="main__button plan-period__btn plan-period__today">
                <input type="number" class="hidden__input" value="1">
                1 день
            </button>
            <button class="main__button plan-period__btn plan-period__week">
                <input type="number" class="hidden__input" value="7">
                7 дней
            </button>
            <button class="main__button plan-period__btn plan-period__month">
                <input type="number" class="hidden__input" value="30">
                30 дней
            </button>
        </div>
         
         <ul class="modal-plan__dates plan-dates">
         </ul>
        
        <div class='confirm__section'>
            <button class='main__button confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button confirm__button confirm__button--cncl'>Отмена</button>
        </div>
      </div>
   </div>
`

const planDateModalAdd2 = `
    <div id='modal' style='z-index: 10001' class='modal modal-plan__date bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 404px'>
        <h2 class='confirm__title confirm__title--plan'>Добавить</h2>
        
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">Несколько</label>
                <input type="checkbox" name="some" id="modal-some">
            </div>
        </div> 
        
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">Делитель смены</label>
                <select name="divider" id="modal-divider">
                    
                </select>
            </div>
        </div> 
        
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">Порядок в смене</label>
                <select name="order" id="modal-queue">
                 
                </select>
            </div>
        </div> 
        
        <div class='confirm__section'>
            <button class='main__button confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button confirm__button confirm__button--cncl'>Отмена</button>
        </div>
      </div>
   </div>
`

export const planDateHandler2 = () => {
  const modal = showModal(planDateModal2)
  const planToday = modal.querySelector('.plan-period__today')
  const planWeek = modal.querySelector('.plan-period__week')
  const planMonth = modal.querySelector('.plan-period__month')

  ;[planToday, planWeek, planMonth].forEach(btn => {
    btn.addEventListener('click', () => {
      const plusDays = Number(btn.querySelector('.hidden__input').value)

      let startDate = new Date(todayStr)
      let endDate = new Date(todayStr)
      endDate.setDate(endDate.getDate() + plusDays)
      endDateInput.value = endDate

      deleteData()
      drawData(startDate, endDate)
    })
  })

  const datesList = modal.querySelector('.plan-dates')
  const endDateInput = modal.querySelector('#end_date')
  let currentDate

  const addedDates = {}

  let today = getTime()
  let todayStr = today.substring(0, today.length - 5).trim()

  const getDays = (start, end) => {
    const oneDay = 1000 * 60 * 60 * 24
    let diff = end.getTime() - start.getTime()

    return Math.round(diff / oneDay)
  }

  const deleteData = () => {
    datesList.querySelectorAll('.plan-dates__item').forEach(date => {
      date.remove()
    })
  }

  const drawData = (startDate, endDate) => {
    let res = getDays(startDate, endDate)
    const flag = !!Object.keys(addedDates).length
    const excludeDates = []

    for (let i = res + 1; i > 1; i--) {
      endDate.setDate(endDate.getDate() - 1)
      let date = endDate.toISOString().split('T')[0]
      let showDate = date.substring(5).split('-')
      ;[showDate[0], showDate[1]] = [showDate[1], showDate[0]]

      if (flag) {
        for (const [addedDate, entry] of Object.entries(addedDates)) {
          if (String(addedDate) === date) {
            for (let j = Number(entry.divider); j > 0; j--) {
              if (entry.queues.includes(String(j))) {
                datesList.insertAdjacentHTML('afterbegin', `
                  <li class="plan-dates__item plan-dates__item--inplan">
                    ${showDate.join('.')}
                    <input type="text" class="hidden__input date" value="${date}">
                    <input type="number" class="hidden__input queue" value="${j}">
                    <input type="number" class="hidden__input divider" value="${entry.divider}">
                  </li>  
                `)
              } else {
                datesList.insertAdjacentHTML('afterbegin', `
                  <li class="plan-dates__item">
                    ${showDate.join('.')}
                    <input type="text" class="hidden__input date" value="${date}">
                    <input type="number" class="hidden__input queue" value="${j}">
                    <input type="number" class="hidden__input divider" value="${entry.divider}">
                  </li>  
                `)
              }
            }

            excludeDates.push(date)
            console.log('added date', date)
          } else if (!excludeDates.includes(date) && !(!!addedDates[date])) {
            console.log('include date', date)
            datesList.insertAdjacentHTML('afterbegin', `
              <li class="plan-dates__item">
                ${showDate.join('.')}
                <input type="text" class="hidden__input date" value="${date}">
                <input type="number" class="hidden__input queue" value="1">
                <input type="number" class="hidden__input divider" value="1">
              </li>  
            `)
          }
        }
      } else {
        datesList.insertAdjacentHTML('afterbegin', `
          <li class="plan-dates__item">
            ${showDate.join('.')}
            <input type="text" class="hidden__input date" value="${date}">
            <input type="number" class="hidden__input queue" value="1">
            <input type="number" class="hidden__input divider" value="1">
          </li>  
        `)
      }
    }

    const excludes = []
    datesList.querySelectorAll('.plan-dates__item').forEach(dateItem => {
      const date = dateItem.querySelector('.date').value
      const queue = dateItem.querySelector('.queue').value
      const divider = dateItem.querySelector('.divider').value
      const planned = dateItem.querySelector('.planned')

      if (excludes.findIndex(exc => exc.date === date && exc.queue === queue && (exc.divider === divider || exc.divider === '1')) === -1) {
        excludes.push({
          'date': date,
          'queue': queue,
          'divider': divider,
          'planned': !!planned
        })
      } else {
        if (!dateItem.classList.contains('plan-dates__item--inplan')) {
          dateItem.remove()
        }
      }
    })
    addHandlers()
  }

  let resObj = {}
  const addHandlers = () => {
    modal.querySelectorAll('.plan-dates__item').forEach(dateItem => {
      dateItem.addEventListener('click', e => {
        const addingModal = showModal(planDateModalAdd2)
        currentDate = dateItem.querySelector('.date').value
        const currentQueue = dateItem.querySelector('.queue').value
        const currentDivider = dateItem.querySelector('.divider').value

        let flag
        if (currentDivider > 1) {
          flag = true
        }

        resObj = {
          'divider': currentQueue,
          'queue': currentDivider
        }

        const some = addingModal.querySelector('#modal-some')
        const divider = addingModal.querySelector('#modal-divider')
        const queue = addingModal.querySelector('#modal-queue')


        if (flag) {
          divider.insertAdjacentHTML('afterbegin', `
            <option value="${currentDivider}">${currentDivider}</option>
          `)
          queue.insertAdjacentHTML('afterbegin', `
            <option value="${currentQueue}">${currentQueue}</option>
          `)
          some.setAttribute('disabled', true)
          some.setAttribute('checked', true)
        }

        some.addEventListener('change', () => {
          if (some.checked) {
            drawAddingOptions(divider)
            drawAddingOptions(queue, 1)
            resObj = {
              'divider': '1',
              'queue': '1'
            }
          } else {
            resObj = {
              'divider': '1',
              'queue': '1'
            }
          }
        })

        divider.addEventListener('change', () => {
          drawAddingOptions(queue, divider.value)
          resObj['divider'] = divider.value
          resObj['queue'] = queue.value
        })

        queue.addEventListener('change', () => {
          resObj['queue'] = queue.value
        })

        const okBtn = addingModal.querySelector('.confirm__button--ok')
        okBtn.addEventListener('click', () => {
          if (typeof addedDates[currentDate] === 'undefined') {
            addedDates[currentDate] = {}
          }
          addedDates[currentDate]['divider'] = resObj.divider

          if (typeof addedDates[currentDate]['queues'] === 'undefined') {
            addedDates[currentDate]['queues'] = []
            addedDates[currentDate]['queues'].push(resObj.queue)
          } else {
            addedDates[currentDate]['queues'].push(resObj.queue)
          }

          deleteData()
          drawData(new Date(todayStr), new Date(endDateInput.value))
        })

        const cnclBtn = addingModal.querySelector('.confirm__button--cncl')
        cnclBtn.addEventListener('click', () => {

        })
      })
    })
  }

  const drawAddingOptions = (elem, max = 3) => {
    elem.querySelectorAll('option').forEach(opt => opt.remove())

    for (let i = 1; i <= max; i++) {
      elem.insertAdjacentHTML('beforeend', `
        <option value="${i}">${i}</option>
      `)
    }
  }

  const okBtn = modal.querySelector('.confirm__button--ok')
  const cnclBtn = modal.querySelector('.confirm__button--cncl')

  okBtn.addEventListener('click', () => {
    console.log(resObj)
    modal.querySelectorAll('.plan-dates__item').forEach(dateItem => {
      const queue = dateItem.querySelector('.queue').value
      const date = dateItem.querySelector('.date').value
    })

  })

  cnclBtn.addEventListener('click', () => modal.click())
}
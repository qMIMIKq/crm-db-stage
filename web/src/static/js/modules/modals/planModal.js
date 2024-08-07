import {showModal} from "./showModal";
import {getTime} from "../getTime";
import {sendData} from "../sendData";
import {appAddr} from "../../../../../../appAddr";

const planDateModal = `
    <div id='modal' style='z-index: 10000' class='modal modal-plan__date bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 435px;height: 435px;'>
        <h2 class='confirm__title confirm__title--plan'>Период</h2>
        <input type="text" class="hidden__input" name="end_date" id="end_date">
        <div class="modal-plan__period plan-period">
            <button class="main__button route__btn plan-period__btn plan-period__today">
                <input type="number" class="hidden__input" value="1">
                1 день
            </button>
            <button class="main__button route__btn plan-period__btn plan-period__week">
                <input type="number" class="hidden__input" value="7">
                7 дней
            </button>
            <button class="main__button route__btn plan-period__btn plan-period__month">
                <input type="number" class="hidden__input" value="30">
                30 дней
            </button>
        </div>
         
         <ul class="modal-plan__dates plan-dates">
         </ul>
         
         <button class="main__button--click plan-divider--modal">Делитель смены</button>
         <button disabled class="main__button--click plan-auto--modal">Авто</button>
         <button disabled class="main__button--click plan-history--modal">История</button>
        
        <div class='confirm__section'>
            <button class='main__button route__btn confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button route__btn confirm__button confirm__button--cncl'>Отмена</button>
        </div>
      </div>
   </div>
`

const planHistoryModal = `
  <div id='modal' style='z-index: 10001' class='modal modal-plan__date--history bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 400px;height: 400px;'>
        <h2 class='confirm__title confirm__title--plan'>История</h2>
         <ul class="modal-plan__dates plan-dates">
         </ul>
      </div>
   </div>
`

const planDateModalAdd = `
    <div id='modal' style='z-index: 100001' class='modal modal-plan__date bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 450px;height: 175px'>
        <h2 class='confirm__title confirm__title--plan'>Добавить</h2>
        
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">Несколько</label>
                <input class="" type="checkbox" name="some" id="modal-some">
            </div>
        </div> 
        
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">Делитель смены</label>
                <select class="" name="divider" id="modal-divider">
                    
                </select>
            </div>
        </div> 
        
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">Порядок в смене</label>
                <select class="" name="order" id="modal-queue">
                 
                </select>
            </div>
        </div> 
        
        <div class='confirm__section'>
            <button class='main__button route__btn confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button route__btn confirm__button confirm__button--cncl'>Отмена</button>
            <button class='main__button route__btn hidden__input confirm__button confirm__button--dlt'>Удалить</button>
        </div>
      </div>
   </div>
`

const changeShiftModal = `
  <div id='modal' style='z-index: 100123' class='modal modal--confirm bounceIn'>
    <div class='modal_content modal-issued' style='width: 350px'>
        <h2 class='confirm__title modal-issued__title'>Автопростановка плана</h2>
        <input 
          type='number'
          class='route__input modal-issued__input text-input main__input main__input'
          name='error_msg' 
          id='error-route__msg'>
        
        <div class='confirm__section'>
            <button class='main__button route__btn confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button route__btn confirm__button confirm__button--cncl'>Отмена</button>
        </div>
    </div>
   </div>
`

function getWeekDay(date) {
  let days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

  return days[date.getDay()];
}

export const planDateHandler = (addedDates, plot, routeID, planned, planDateInput, needShifts) => {
  const modal = showModal(planDateModal)
  const planToday = modal.querySelector('.plan-period__today')
  const planWeek = modal.querySelector('.plan-period__week')
  const planMonth = modal.querySelector('.plan-period__month')
  const planHistory = modal.querySelector('.plan-history--modal')

  const planDivider = modal.querySelector('.plan-divider--modal')
  planDivider.addEventListener('click', () => {
    planDivider.classList.toggle('route__filter--chosen')
  })

  if (addedDates) {
    planHistory.removeAttribute('disabled')
    planHistory.addEventListener('click', () => {
      const historyModal = showModal(planHistoryModal)
      const historyList = historyModal.querySelector('.plan-dates')

      Object.keys(addedDates).forEach(date => {
        historyList.insertAdjacentHTML('afterbegin', `
          <li class="plan-dates__item plan-dates__item--history route__btn">
            ${date.replaceAll('-', '.')}
          </li>
         `)
      })
    })
  }

  const autoBtn = modal.querySelector('.plan-auto--modal')
  autoBtn.removeAttribute('disabled')
  autoBtn.addEventListener('click', () => {
    const shiftsModal = showModal(changeShiftModal)
    const drawPlanBtn = shiftsModal.querySelector('.confirm__button--ok')
    let shifts = shiftsModal.querySelector('#error-route__msg')
    shifts.value = needShifts || 0
    drawPlanBtn.addEventListener('click', () => {
      modal.querySelectorAll('.plan-dates__item--inplan').forEach(planItem => {
        planItem.click()
      })

      shifts = shiftsModal.querySelector('#error-route__msg').value
      const planItems = modal.querySelectorAll('.plan-dates__item')
      let inPlan = 0
      for (let i = 0; i < planItems.length; i++) {
        const item = planItems[i]
        if (inPlan < shifts) {
          if (!item.classList.contains('plan-dates__item--busy')) {
            inPlan++
            item.click()
          }
        } else {
          break
        }
      }

      shiftsModal.click()
    })

    const cnclBtn = shiftsModal.querySelector('.confirm__button--cncl')
    cnclBtn.addEventListener('click', () => {
      modal.querySelectorAll('.plan-dates__item--inplan').forEach(planItem => {
        planItem.click()
      })

      shiftsModal.click()
    })
  })

  let newBusy = []
  sendData(`${appAddr}/api/plans/get-busy`, 'POST', JSON.stringify({"plot": plot, "route_id": routeID}))
    .then(res => {
      return res.json()
    })
    .then(data => {
      if (data.data) {
        data.data.map(dateInfo => {
          dateInfo['date'] = dateInfo['date'].split('T')[0]

          if (!newBusy[dateInfo['date']]) {
            newBusy[dateInfo['date']] = {
              'divider': dateInfo.divider,
              'queues': dateInfo['queues'].split(', ')
            }
          } else {
            newBusy[dateInfo['date']].queues.push(dateInfo['queues'])
          }

        })
      }
    }).then(() => {
    const modalBusyDates = Object.keys(newBusy)

    ;[planToday, planWeek, planMonth].forEach(btn => {
      btn.addEventListener('click', () => {
        const plusDays = Number(btn.querySelector('.hidden__input').value)

        let startDate = new Date(todayStr)
        let endDate = new Date(todayStr)
        endDate.setDate(endDate.getDate() + plusDays)
        endDateInput.value = endDate

        deleteData()
        // let start = new Date(todayStr)
        // start.setDate(start.getDate() - 1)
        // drawData(start, new Date(endDateInput.value))

        drawData(startDate, endDate)
      })
    })

    const datesList = modal.querySelector('.plan-dates')
    const endDateInput = modal.querySelector('#end_date')
    let currentDate

    let today = getTime()
    let todayStr = today.substring(0, today.length - 5).trim()
    let modalAddedDates = addedDates ? addedDates : []
    let resObj = {}
    let flag = !!Object.keys(modalAddedDates).length

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

    const addHandlers = () => {
      modal.querySelectorAll('.plan-dates__item').forEach(dateItem => {
        dateItem.addEventListener('click', e => {
          if (dateItem.classList.contains('plan-dates__item--busy')) {
            return
          }

          const addingModal = showModal(planDateModalAdd)
          if (planDivider.classList.contains('route__filter--chosen')) {
            addingModal.classList.remove('hidden__input')
          }

          const okBtn = addingModal.querySelector('.confirm__button--ok')
          const cnclBtn = addingModal.querySelector('.confirm__button--cncl')
          const dltBtn = addingModal.querySelector('.confirm__button--dlt')

          if (dateItem.classList.contains('plan-dates__item--inplan')) {
            okBtn.remove()
            cnclBtn.remove()

            dltBtn.classList.remove('hidden__input')
          }

          currentDate = dateItem.querySelector('.date').value
          const currentQueue = dateItem.querySelector('.queue').value
          const currentDivider = dateItem.querySelector('.divider').value

          const flag = currentDivider > 1
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
          })

          okBtn.addEventListener('click', () => {
            if (typeof modalAddedDates[currentDate] === 'undefined') {
              modalAddedDates[currentDate] = {}
            }

            modalAddedDates[currentDate]['divider'] = divider.value ? divider.value : '1'

            if (typeof modalAddedDates[currentDate]['queues'] === 'undefined') {
              modalAddedDates[currentDate]['queues'] = []
              modalAddedDates[currentDate]['queues'].push(queue.value ? queue.value : '1')
            } else {
              modalAddedDates[currentDate]['queues'].push(queue.value ? queue.value : '1')
            }

            deleteData()
            drawData(new Date(todayStr), new Date(endDateInput.value))
            addingModal.click()
          })

          cnclBtn.addEventListener('click', () => {
            addingModal.click()
          })

          dltBtn.addEventListener('click', () => {
            if (modalAddedDates[currentDate].queues.length === 1) {
              delete modalAddedDates[currentDate]
            } else {
              const ind = modalAddedDates[currentDate].queues.findIndex((value => value === queue.value))
              modalAddedDates[currentDate].queues.splice(ind, 1)
            }

            deleteData()
            drawData(new Date(todayStr), new Date(endDateInput.value))
            addingModal.click()
          })

          if (!planDivider.classList.contains('route__filter--chosen')) {
            if (!dltBtn.classList.contains('hidden__input')) {
              dltBtn.click()
            } else {
              okBtn.click()
            }
          }
        })
      })
    }

    const drawData = (startDate, endDate) => {
      let res = getDays(startDate, endDate)
      const excludeDates = []
      flag = !!Object.keys(modalAddedDates).length

      for (let i = res + 1; i > 1; i--) {
        endDate.setDate(endDate.getDate() - 1)
        let weekDay = getWeekDay(endDate)
        let date = endDate.toISOString().split('T')[0]
        let showDate = date.substring(5).split('-')
        ;[showDate[0], showDate[1]] = [showDate[1], showDate[0]]
        showDate = showDate.join('.')
        showDate += `/${weekDay}`

        if (flag) {
          for (const [addedDate, entry] of Object.entries(modalAddedDates)) {
            if (String(addedDate) === date) {
              for (let j = Number(entry.divider); j > 0; j--) {
                if (entry.queues.includes(String(j))) {
                  datesList.insertAdjacentHTML('afterbegin', `
                  <li class="plan-dates__item route__btn plan-dates__item--inplan">
                    ${showDate}
                    <input type="text" class="hidden__input date" value="${date}">
                    <input type="number" class="hidden__input queue" value="${j}">
                    <input type="number" class="hidden__input divider" value="${entry.divider}">
                  </li>  
                `)
                } else {
                  if (newBusy[date] && newBusy[date].queues.includes(String(j))) {
                    datesList.insertAdjacentHTML('afterbegin', `
                      <li class="plan-dates__item route__btn plan-dates__item--busy">
                        ${showDate}
                        <input type="text" class="hidden__input date" value="${date}">
                        <input type="number" class="hidden__input queue" value="${j}">
                        <input type="number" class="hidden__input divider" value="${entry.divider}">
                      </li>
                    `)
                  } else {
                    datesList.insertAdjacentHTML('afterbegin', `
                      <li class="plan-dates__item route__btn">
                        ${showDate}
                        <input type="text" class="hidden__input date" value="${date}">
                        <input type="number" class="hidden__input queue" value="${j}">
                        <input type="number" class="hidden__input divider" value="${entry.divider}">
                      </li>
                    `)
                  }
                }
              }

              excludeDates.push(date)
            } else if (!excludeDates.includes(date) && !(!!modalAddedDates[date])) {
              if (modalBusyDates.includes(date)) {
                for (const [busyDate, busyDateInfo] of Object.entries(newBusy)) {
                  if (busyDate === date) {
                    for (let j = Number(busyDateInfo.divider); j > 0; j--) {
                      if (busyDateInfo.queues.includes(String(j))) {
                        datesList.insertAdjacentHTML('afterbegin', `
                          <li class="plan-dates__item route__btn plan-dates__item--busy">
                            ${showDate}
                            <input type="text" class="hidden__input date" value="${date}">
                            <input type="number" class="hidden__input queue" value="${j}">
                            <input type="number" class="hidden__input divider" value="${busyDateInfo.divider}">
                          </li>  
                        `)
                      } else {
                        datesList.insertAdjacentHTML('afterbegin', `
                          <li class="plan-dates__item route__btn">
                            ${showDate}
                            <input type="text" class="hidden__input date" value="${date}">
                            <input type="number" class="hidden__input queue" value="${j}">
                            <input type="number" class="hidden__input divider" value="${busyDateInfo.divider}">
                          </li>  
                        `)
                      }
                    }
                  }
                }
              } else {
                datesList.insertAdjacentHTML('afterbegin', `
                  <li class="plan-dates__item route__btn">
                    ${showDate}
                    <input type="text" class="hidden__input date" value="${date}">
                    <input type="number" class="hidden__input queue" value="1">
                    <input type="number" class="hidden__input divider" value="1">
                  </li>  
                `)
              }
            }
          }
        } else {
          if (modalBusyDates.includes(date)) {
            for (const [busyDate, busyDateInfo] of Object.entries(newBusy)) {
              if (busyDate === date) {
                for (let j = Number(busyDateInfo.divider); j > 0; j--) {
                  if (busyDateInfo.queues.includes(String(j))) {
                    datesList.insertAdjacentHTML('afterbegin', `
                      <li class="plan-dates__item route__btn plan-dates__item--busy">
                        ${showDate}
                        <input type="text" class="hidden__input date" value="${date}">
                        <input type="number" class="hidden__input queue" value="${j}">
                        <input type="number" class="hidden__input divider" value="${busyDateInfo.divider}">
                      </li>  
                    `)
                  } else {
                    datesList.insertAdjacentHTML('afterbegin', `
                      <li class="plan-dates__item route__btn">
                        ${showDate}
                        <input type="text" class="hidden__input date" value="${date}">
                        <input type="number" class="hidden__input queue" value="${j}">
                        <input type="number" class="hidden__input divider" value="${busyDateInfo.divider}">
                      </li>  
                    `)
                  }
                }
              }
            }
          } else {
            datesList.insertAdjacentHTML('afterbegin', `
              <li class="plan-dates__item route__btn">
                ${showDate}
                <input type="text" class="hidden__input date" value="${date}">
                <input type="number" class="hidden__input queue" value="1">
                <input type="number" class="hidden__input divider" value="1">
              </li>  
            `)
          }
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
      for (const [addedDate, entry] of Object.entries(modalAddedDates)) {
        addedDates.push({
          'date': addedDate,
          'date_info': entry
        })
      }

      planned['planned'] = true
      planDateInput.value = 'В планировании'

      modal.click()
      console.log(addedDates, modalAddedDates)
    })

    cnclBtn.addEventListener('click', () => {
      modalAddedDates = []
      addedDates = []

      console.log(modalAddedDates)
      console.log(addedDates)
      console.log(Array.isArray(addedDates), Array.isArray(modalAddedDates))
      modal.click()
    })

    planMonth.click()
  })
}
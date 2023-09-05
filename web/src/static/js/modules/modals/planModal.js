import {showModal} from "./showModal";
import {getTime} from "../getTime";
import {sendData} from "../sendData";
import {appAddr} from "../state";

const planDateModal = `
    <div id='modal' style='z-index: 10000' class='modal modal-plan__date bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 470px'>
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

const planDateModalAdd = `
    <div id='modal' style='z-index: 10001' class='modal modal-plan__date bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 450px'>
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

export const planDateHandler = (addedDates, plot) => {
  const modal = showModal(planDateModal)
  const planToday = modal.querySelector('.plan-period__today')
  const planWeek = modal.querySelector('.plan-period__week')
  const planMonth = modal.querySelector('.plan-period__month')

  let newBusy = []
  sendData(`${appAddr}/api/plans/get-busy`, 'POST', JSON.stringify({"plot": plot}))
    .then(res => {
      return res.json()
    })
    .then(data => {
      if (data.data) {
        console.log(data.data)
        data.data.map(dateInfo => {
          dateInfo['queues'] = dateInfo['queues'].split(', ')
          dateInfo['date'] = dateInfo['date'].split('T')[0]

          newBusy[dateInfo['date']] = {
            'divider': dateInfo.divider,
            'queues': dateInfo.queues
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
        drawData(startDate, endDate)
      })
    })

    const datesList = modal.querySelector('.plan-dates')
    const endDateInput = modal.querySelector('#end_date')
    let currentDate

    let today = getTime()
    let todayStr = today.substring(0, today.length - 5).trim()
    let modalAddedDates = addedDates ? addedDates : {}
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

    const drawAddedData = () => {
      for (const [addedDate, entry] of Object.entries(modalAddedDates)) {
        let showDate = addedDate.substring(5).split('-')
        ;[showDate[0], showDate[1]] = [showDate[1], showDate[0]]

        for (let j = Number(entry.divider); j > 0; j--) {
          if (entry.queues.includes(String(j))) {
            datesList.insertAdjacentHTML('beforeend', `
            <li class="plan-dates__item plan-dates__item--inplan">
              ${showDate.join('.')}
              <input type="text" class="hidden__input date" value="${addedDate}">
              <input type="number" class="hidden__input queue" value="${j}">
              <input type="number" class="hidden__input divider" value="${entry.divider}">
            </li>  
          `)
          }
        }
      }
    }

    const addHandlers = () => {
      modal.querySelectorAll('.plan-dates__item').forEach(dateItem => {
        dateItem.addEventListener('click', e => {
          if (dateItem.classList.contains('plan-dates__item--busy')) {
            return
          }

          const addingModal = showModal(planDateModalAdd)
          currentDate = dateItem.querySelector('.date').value
          const currentQueue = dateItem.querySelector('.queue').value
          const currentDivider = dateItem.querySelector('.divider').value

          const flag = currentDivider > 1

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
            if (typeof modalAddedDates[currentDate] === 'undefined') {
              modalAddedDates[currentDate] = {}
            }
            modalAddedDates[currentDate]['divider'] = resObj.divider

            if (typeof modalAddedDates[currentDate]['queues'] === 'undefined') {
              modalAddedDates[currentDate]['queues'] = []
              modalAddedDates[currentDate]['queues'].push(resObj.queue)
            } else {
              modalAddedDates[currentDate]['queues'].push(resObj.queue)
            }

            deleteData()
            drawData(new Date(todayStr), new Date(endDateInput.value))
            addingModal.click()
          })

          const cnclBtn = addingModal.querySelector('.confirm__button--cncl')
          cnclBtn.addEventListener('click', () => {

          })
        })
      })
    }

    if (flag) {
      drawAddedData()
      addHandlers()
    }


    const drawData = (startDate, endDate) => {
      let res = getDays(startDate, endDate)
      const excludeDates = []
      flag = !!Object.keys(modalAddedDates).length

      for (let i = res + 1; i > 1; i--) {
        endDate.setDate(endDate.getDate() - 1)
        let date = endDate.toISOString().split('T')[0]
        let showDate = date.substring(5).split('-')
        ;[showDate[0], showDate[1]] = [showDate[1], showDate[0]]

        if (flag) {
          for (const [addedDate, entry] of Object.entries(modalAddedDates)) {
            console.log(addedDate)
            if (String(addedDate) === date) {
              console.log('HELLO SUKA')
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
                  <li class="plan-dates__item ${modalBusyDates.includes(date) ? 'plan-dates__item--busy' : ''}">
                    ${showDate.join('.')}
                    <input type="text" class="hidden__input date" value="${date}">
                    <input type="number" class="hidden__input queue" value="${j}">
                    <input type="number" class="hidden__input divider" value="${entry.divider}">
                  </li>  
                `)
                }
              }

              excludeDates.push(date)
            } else if (!excludeDates.includes(date) && !(!!modalAddedDates[date])) {
              datesList.insertAdjacentHTML('afterbegin', `
              <li class="plan-dates__item ${modalBusyDates.includes(date) ? 'plan-dates__item--busy' : ''}">
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
          <li class="plan-dates__item ${modalBusyDates.includes(date) ? 'plan-dates__item--busy' : ''}">
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
      modal.click()

      console.log(modalAddedDates)
      for (const [addedDate, entry] of Object.entries(modalAddedDates)) {
        addedDates.push({
          'date': addedDate,
          'date_info': entry
        })
      }
    })

    cnclBtn.addEventListener('click', () => {
      addedDates = {}
      modal.click()
    })
  })
}
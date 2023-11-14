import {sendData} from "../modules/sendData";
import {appAddr} from "../../../../../appAddr";
import {getTime} from "../modules/getTime";
import {showModal} from "../modules/modals/showModal";
import {getPlans} from "./getPlans";
import {addTriggers} from "../modules/addTriggers";
import {triggerFilesModal} from "../modules/modals/downloadFilesModal";

export const table = document.querySelector('.main-table')

export const getDays = (start, end) => {
  const oneDay = 1000 * 60 * 60 * 24
  let diff = end.getTime() - start.getTime()

  return Math.round(diff / oneDay)
}

const planDateModalAdd = `
    <div id='modal' style='z-index: 10001' class='modal hidden__input modal-plan__date bounceIn'>
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
            <button class='main__button confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button confirm__button confirm__button--cncl'>Отмена</button>
            <button class='main__button hidden__input confirm__button confirm__button--dlt'>Удалить</button>
        </div>
      </div>
   </div>
`

function getWeekDay(date) {
  let days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

  return days[date.getDay()];
}

export let globalDatesObj = {}
let foundedPlots = []

export const drawPlan = (d, data) => {
  let uniqueFileNames = []

  if (d.files !== null && d.files !== undefined) {
    d.files.forEach(file => {
      const arrDotFile = file.split('.')
      const fileType = arrDotFile[arrDotFile.length - 1]

      const arrSlashFile = file.split('/')
      arrSlashFile.splice(0, 3)
      const fileName = arrSlashFile.join('')
      let fileNameWithoutType = fileName.split('.')
      fileNameWithoutType = fileNameWithoutType.splice(0, fileNameWithoutType.length - 1).join('.')

      switch (fileType) {
        case 'png':
        case 'PNG':
          if (!uniqueFileNames.includes(fileNameWithoutType))
            uniqueFileNames.push(fileNameWithoutType)
          break
        default:
          uniqueFileNames.push(fileNameWithoutType)
      }
    })
  }

  table.insertAdjacentHTML(`afterbegin`, `
    <form id="form-${d.id}" class='table-form table-form--plan table-form--old' method='POST'>
      <ul class='main-table__item'>
          <li class='table-body_cell table__db'>
              <input id='db_id' class='table__data main__button' name='id' type='number' readonly value='${d.order_id}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__timestamp'>
              <input id="timestamp" class='table__data table__data--ro' name='timestamp' type='text' readonly value='${d.timestamp.split("T")[0].replaceAll("-", ".")}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell hidden-input'>
              <input id='files' class='table__data  table__data--ro hidden-input' name='files' type='text' value='${d.files ? d.files.join(', ') : ''}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__files'>
              <input id="total_files" class='main__button table__data  click-chose table__data--ro' type='text' readonly value='${uniqueFileNames.length}' tabindex='-1' autocomplete='off'>
          </li>   
          <li class='table-body_cell table-body__helper ${d.number ? "table-body__attr" : ""}  table__number'>
              <input 
              readonly
              id='number' class='table__data table__data--ro' name='number' type='text' value='${d.number}' tabindex='-1' autocomplete='off'>
          </li>
          <li  class='table-body_cell table-body__helper ${d.client ? "table-body__attr" : ""} table__client'>
              <input readonly class='table__data table__data--ro' type='text' name='client' value='${d.client}' tabindex='-1' autocomplete='off'>
          </li>
          <li  class='table-body_cell table-body__helper ${d.name ? "table-body__attr" : ""} table__name'>
              <input readonly class='table__data table__data--ro' type='text' name='name' value='${d.name}' tabindex='-1' autocomplete='off'>
          </li>
          <li  class='table-body_cell table-body__helper ${d.material ? "table-body__attr" : ""} table__material'>
              <input readonly class='table__data table__data--ro' type='text' name='material' value='${d.material}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__quantity'>
              <input readonly class='table__data table__data--ro' type='number' name='quantity' required value='${d.quantity}' autocomplete='off'>
          </li>
          <li class="table-body_cell table__issued--report">
              <input readonly class="table__data table__data--ro" tabindex="-1"
              type="number" 
              name="issued" 
              required  autocomplete="off"
              value="${d.issued}">
          </li>
          <li class="table-body_cell table__route--report">
              <input readonly type="text" class="table__data table__data--ro" value="${d.route_plot}">
          </li>
          <li class="table-body_cell hidden__input table__route--report">
              <input readonly type="text" class="table__data" value="${d.route_id}">
          </li>
          
          <li class="table-body_cell table__route--date">
            <ul class="table__route--date__list">
<!--                <li class="table__route&#45;&#45;date__item">24.10/ВТ</li>-->
<!--                <li class="table__route&#45;&#45;date__item">24.10/ВТ</li>-->
<!--                <li class="table__route&#45;&#45;date__item">24.10/ВТ</li>-->
<!--                <li class="table__route&#45;&#45;date__item">24.10/ВТ</li>-->
<!--                <li class="table__route&#45;&#45;date__item">24.10/ВТ</li>-->
<!--                <li class="table__route&#45;&#45;date__item">24.10/ВТ</li>-->
<!--                <li class="table__route&#45;&#45;date__item">24.10/ВТ</li>-->
            </ul>
          </li>
          
        </ul>
    </form>
  `)


  let dbAddedDates = []
  let addedDates = []

  if (d['db_plan']) {
    dbAddedDates = d['db_plan']

    dbAddedDates.forEach(dateInfo => {
      addedDates[dateInfo['date'].split('T')[0]] = {
        'divider': dateInfo.divider,
        'queues': dateInfo['queues'].split(', ')
      }
    })
  }

  const currentOrder = document.querySelector(`#form-${d.id}`)
  planningHandler(currentOrder, d, addedDates)
  addTriggers(currentOrder, '.table__files', triggerFilesModal)

  // addTriggers("#db_id", showRoutesIssued)
  // addTriggers(".table__files", triggerFilesModal)
  // addTriggers(".table__route", triggerRoutesModal)
  // addTriggers(".table__comment", triggerCommentsModal)
}

const planningHandler = (currentOrder, d, addedDates) => {
  let newBusy = []
  sendData(`${appAddr}/api/plans/get-busy`, 'POST', JSON.stringify({"plot": d.route_plot, "route_id": d.route_id}))
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

    const datesList = currentOrder.querySelector('.table__route--date__list')
    const endDateInput = currentOrder.querySelector('#end_date')
    let currentDate

    let today = getTime()
    let todayStr = today.substring(0, today.length - 5).trim()
    let modalAddedDates = addedDates ? addedDates : []
    let resObj = {}
    let flag = !!Object.keys(modalAddedDates).length

    const deleteData = () => {
      datesList.querySelectorAll('.plan-dates__item').forEach(date => {
        date.remove()
      })
    }

    const createDataObject = () => {
      for (const [addedDate, entry] of Object.entries(modalAddedDates)) {
        const ind = addedDates.findIndex(dateInfo => dateInfo.date === addedDate)

        if (ind === 0) {
          addedDates.push({
            'date': addedDate,
            'date_info': entry
          })
        }
      }

      let resAddedDates = []
      for (const [addedDate, entry] of Object.entries(addedDates)) {
        resAddedDates.push({
          'date': addedDate,
          'date_info': entry
        })
      }

      console.log(d.material, d.client, d.timestamp)
      return {
        'route_id': d.route_id,
        'order_id': d.order_id,
        'timestamp': d.timestamp,
        'material': d.material,
        'client': d.client,
        'number': d.number,
        'name': d.name,
        'route_plot': d.route_plot,
        'added_dates': resAddedDates
      }
    }

    const addHandlers = () => {
      currentOrder.querySelectorAll('.plan-dates__item').forEach(dateItem => {
        dateItem.addEventListener('click', e => {
          if (dateItem.classList.contains('plan-dates__item--busy')) {
            return
          }

          const addingModal = showModal(planDateModalAdd)
          if (document.querySelector('.plan-divider').classList.contains('route__filter--chosen')) {
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

            sendData(`${appAddr}/api/plans/update`, 'POST', JSON.stringify(createDataObject()))
              .then(res => {
                addingModal.click()
                getPlans(false)
              })

            deleteData()
            drawData()
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


            sendData(`${appAddr}/api/plans/update`, 'POST', JSON.stringify(createDataObject()))
              .then(res => {
                addingModal.click()
                getPlans(false)
              })

            // deleteData()
            // drawData()
          })

          if (!document.querySelector('.plan-divider').classList.contains('route__filter--chosen')) {
            if (!dltBtn.classList.contains('hidden__input')) {
              dltBtn.click()
            } else {
              okBtn.click()
            }
          }
        })
      })
    }

    // if (flag) {
    //   drawAddedData()
    //   addHandlers()
    // }


    const drawData = (startDate, endDate) => {
      const from = document.querySelector('.header-routes__planned-date--report__from').value
      const to = document.querySelector('.header-routes__planned-date--report__to').value

      startDate = new Date(from)
      endDate = new Date(to)
      endDate.setDate(endDate.getDate() + 1)

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
        // showDate += `/${weekDay}`

        if (flag) {
          for (const [addedDate, entry] of Object.entries(modalAddedDates)) {
            if (String(addedDate) === date) {
              for (let j = Number(entry.divider); j > 0; j--) {
                if (entry.queues.includes(String(j))) {
                  datesList.insertAdjacentHTML('afterbegin', `
                  <li class="plan-dates__item plan-dates__item--small route__btn plan-dates__item--inplan">
                    ${showDate}
                    <input type="text" class="hidden__input date" value="${date}">
                    <input type="number" class="hidden__input queue" value="${j}">
                    <input type="number" class="hidden__input divider" value="${entry.divider}">
                  </li>  
                `)
                } else {
                  if (newBusy[date] && newBusy[date].queues.includes(String(j))) {
                    datesList.insertAdjacentHTML('afterbegin', `
                      <li class="plan-dates__item plan-dates__item--small route__btn plan-dates__item--busy">
                        ${showDate}
                        <input type="text" class="hidden__input date" value="${date}">
                        <input type="number" class="hidden__input queue" value="${j}">
                        <input type="number" class="hidden__input divider" value="${entry.divider}">
                      </li>
                    `)
                  } else {
                    datesList.insertAdjacentHTML('afterbegin', `
                      <li class="plan-dates__item plan-dates__item--small route__btn">
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
                          <li class="plan-dates__item plan-dates__item--small route__btn plan-dates__item--busy">
                            ${showDate}
                            <input type="text" class="hidden__input date" value="${date}">
                            <input type="number" class="hidden__input queue" value="${j}">
                            <input type="number" class="hidden__input divider" value="${busyDateInfo.divider}">
                          </li>  
                        `)
                      } else {
                        datesList.insertAdjacentHTML('afterbegin', `
                          <li class="plan-dates__item plan-dates__item--small route__btn">
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
                  <li class="plan-dates__item plan-dates__item--small route__btn">
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
                      <li class="plan-dates__item plan-dates__item--small route__btn plan-dates__item--busy">
                        ${showDate}
                        <input type="text" class="hidden__input date" value="${date}">
                        <input type="number" class="hidden__input queue" value="${j}">
                        <input type="number" class="hidden__input divider" value="${busyDateInfo.divider}">
                      </li>  
                    `)
                  } else {
                    datesList.insertAdjacentHTML('afterbegin', `
                      <li class="plan-dates__item plan-dates__item--small route__btn">
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
              <li class="plan-dates__item plan-dates__item--small route__btn">
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

      // if (!foundedPlots.includes(d.route_plot)) {
      //   foundedPlots.push(d.route_plot)
      //   let maxDivider = {}
      //
      //   datesList.querySelectorAll('.plan-dates__item').forEach(dateItem => {
      //     const maxDiv = maxDivider[dateItem.textContent.trim()]
      //
      //     if (!maxDiv) {
      //       maxDivider[dateItem.textContent.trim()] = 1
      //     } else {
      //       maxDivider[dateItem.textContent.trim()]++
      //     }
      //   })
      //
      //   for (const [date, divider] of Object.entries(maxDivider)) {
      //     const globalDate = globalDatesObj[date]
      //
      //     if (!globalDate) {
      //       globalDatesObj[date] = divider
      //     } else {
      //       globalDatesObj[date] = Math.max(globalDatesObj[date], divider)
      //     }
      //
      //     // console.log(date, divider)
      //   }
      //
      //   console.log('global dates', globalDatesObj)
      // }


      // console.log(globalDatesObj)


      // console.log()
      addHandlers()
    }

    drawData()

    const planToday = document.querySelector('.plan-period__today')
    const planWeek = document.querySelector('.plan-period__week')
    const planMonth = document.querySelector('.plan-period__month')

    const changeTimeHandler = e => {
        const plusDays = Number(e.target.querySelector('.hidden__input').value)

        let endDate = new Date(todayStr)
        endDate.setDate(endDate.getDate() + plusDays)
        console.log(endDate)
        document.querySelector('.header-routes__planned-date--report__to').value = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

        deleteData()
        // let start = new Date(todayStr)
        // start.setDate(start.getDate() - 1)
        // drawData(start, new Date(endDateInput.value))
        drawData()
      }

    ;[planToday, planWeek, planMonth].forEach(btn => {
      btn.removeEventListener('click', changeTimeHandler)
      btn.addEventListener('click', changeTimeHandler)
    })

    const drawAddingOptions = (elem, max = 3) => {
      elem.querySelectorAll('option').forEach(opt => opt.remove())

      for (let i = 1; i <= max; i++) {
        elem.insertAdjacentHTML('beforeend', `
        <option value="${i}">${i}</option>
      `)
      }
    }
  })
}
import {showModal} from "../modules/modals/showModal";
import {activateNextStage, activateOnInput} from "../modules/modals/routesModal";
import {sendData} from "../modules/sendData";
import {appAddr} from "../../../../../appAddr";
import {getPlans} from "./getPlans";
import {state} from "../modules/state";

const shiftModal = `
  <div id='modal' style='z-index: 100123' class='modal modal--confirm bounceIn'>
    <div class='modal_content modal-issued' style='width: 350px'>
<!--         <div class='modal__header modal-header'>-->
<!--              <h2 class='comments__title'>Сдвинуть план</h2>                -->
<!--         </div>-->
         
        <h2 class='confirm__title modal-issued__title'>Заполнить план на</h2>
        <input 
          type='number'
          class='route__input modal-issued__input text-input main__input main__input'
          name='error_msg' 
          id='error-route__msg'>
        
        <div class='confirm__section'>
            <button disabled class='main__button route__btn confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button route__btn confirm__button confirm__button--cncl'>Отмена</button>
        </div>
    </div>
   </div>
`

export const autoShiftHandler = (shifter, moveTo, addedDates, currentOrder) => {
  const modal = showModal(shiftModal)
  const startTime = document.querySelector('.header-routes__planned-date--report__from').value

  const title = modal.querySelector('.modal-issued__title')
  const shifts = modal.querySelector('.modal-issued__input')
  const okBtn = modal.querySelector('.confirm__button--ok')
  const cnclBtn = modal.querySelector('.confirm__button--cncl')

  let needShifts = currentOrder.querySelector('input[name="need_shifts"]').value
  let totalShifts = currentOrder.querySelector('input[name="shifts"]').value

  console.log(totalShifts, needShifts)

  if (needShifts && needShifts !== '') {
    totalShifts = totalShifts ? Number(totalShifts) : 0
    needShifts = Number(needShifts) - totalShifts

    if (needShifts <= 0) {
      needShifts = ''
    } else {
      shifts.value = needShifts
      activateNextStage('confirm__button--ok')
    }
  }

  const current = {
    'id': currentOrder.getAttribute('id').split('-')[1],
    'route_plot': currentOrder.querySelector('input[name="route_plot"]').value,
    'eldest_date': '',
    'first_date': ''
  }

  const currentDates = currentOrder.querySelectorAll('.plan-dates__item--inplan')
  current.first_date = currentDates[0].querySelector('.date').value
  current.eldest_date = currentDates[currentDates.length - 1].querySelector('.date').value

  console.log(current)
  let checkDates = state.orders.filter(order => String(order.id) !== current.id && order.route_plot === current.route_plot)

  let canMove = false
  const endDate = new Date(startTime)
  let lastDate
  if (addedDates) {
    const eldestDates = Object.keys(addedDates)
    const eldestDate = new Date(eldestDates[eldestDates.length - 1])
    lastDate = eldestDates[eldestDates.length - 1]
    // console.log(endDate, eldestDate)
    console.log(lastDate)

    if (eldestDate.getTime() >= endDate.getTime()) {
      console.log('WE GOT OLD')
      canMove = true
    } else {
      console.log('HOLY SHIT')
      endDate.setDate(endDate.getDate() - 1)
      lastDate = endDate
      // shifts.setAttribute('disabled', 'true')
    }

    console.log()
  } else {
    endDate.setDate(endDate.getDate() - 1)
    lastDate = endDate
  }

  switch (moveTo) {
    case 'forw':
      title.textContent += ' вперёд'
      break
    case 'prev':
      title.textContent += ' назад'
      break
  }

  shifts.addEventListener('input', e => {
    activateOnInput(e, 'confirm__button--ok')
  })

  const handleClose = () => {
    currentOrder.querySelectorAll('.table__data').forEach(data => {
      data.classList.remove('table__data--chosen')
    })
    currentOrder.querySelector('.table__route--date__list').classList.remove('table__data--chosen')
    modal.click()
  }

  okBtn.addEventListener('click', () => {
    shifter['move_to'] = moveTo
    shifter['shifts'] = Number(shifts.value)
    shifter['last_date'] = current.first_date

    // console.log(shifter)

    sendData(`${appAddr}/api/plans/shift-auto`, 'POST', JSON.stringify(shifter))
      .then(resp => {
        return resp.json()
      })
      .then(res => {
        console.log(res)
        handleClose()
        getPlans()
      })
  })

  cnclBtn.addEventListener('click', () => {
    handleClose()
  })

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      currentOrder.querySelectorAll('.table__data').forEach(data => {
        data.classList.remove('table__data--chosen')
      })
      currentOrder.querySelector('.table__route--date__list').classList.remove('table__data--chosen')
    }
  })
}
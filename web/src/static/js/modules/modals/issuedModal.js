import {showModal} from "./showModal";
import {activateOnInput, addLog, addReportMsg, drawPlots} from "./routesModal";
import {user} from "../../table";
import {state} from "../state";
import {getTime} from "../getTime";

const changeIssuedModal = `
  <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
    <div class='modal_content modal-issued' style='width: 350px'>
        <h2 class='confirm__title modal-issued__title'>За смену</h2>
<!--        <label class='route__label' for='route__plot'>Участок</label>-->
        <select class='clickable route__select hidden__input main__button main__select route__select--plot' name='plot' id='route__plot'>
            <option selected disabled>Выберите участок</option>
        </select>
        
        <select disabled class='hidden__input' id='plot-connection'>
        </select>
        
        <label class='route__label' for='route__user'>Оператор</label>
        <select class='route__select main__button main__select route__select--user' name='user' id='route__user'>
        </select>
        
        <label class='route__label' for='route__user'>Смена</label>
        <select class='route__select main__button main__select route__select--user' name='shift' id='route__shift'>
            <option value="" selected></option>
            <option value="Первая">Первая</option>
            <option value="Последняя">Последняя</option>
        </select>
        
        <label class='route__label'>Дата</label>
        <input type="date" class="main__button modal-issued__date route__input">
      
        <input 
          type='number'
          class='route__input modal-issued__input text-input main__input main__input'
          name='error_msg' 
          id='error-route__msg'>
        
        <div class='confirm__section'>
            <button disabled class='main__button--click confirm__button confirm__button--ok issued-ok'>ОК</button>
            <button class='main__button--click confirm__button confirm__button--cncl'>Отмена</button>
        </div>
    </div>
   </div>
`

export const issuedHandler = (e, issuedInput, issuedTodayInput, plotI, userI, updateData, shift, startTime) => {
  const modal = showModal(changeIssuedModal)
  const okBtn = modal.querySelector('.confirm__button--ok')
  const cnclBtn = modal.querySelector('.confirm__button--cncl')
  const userData = modal.querySelector('.route__select--user')
  const plot = modal.querySelector('.route__select--plot')
  const date = modal.querySelector('.modal-issued__date')
  const modalShift = modal.querySelector('#route__shift')

  const check = state.adminCheck || state.techCheck
  let today = getTime()
  today = today.substring(0, today.length - 5).trim()
  date.value = today
  date.setAttribute('max', today)

  // console.log(userI)

  if (!check) {
    userData.classList.add('hidden__input')
    plot.classList.add('hidden__input')
    date.classList.add('hidden__input')
    modal.querySelectorAll('.route__label').forEach(label => label.classList.add('hidden__input'))
  }

  const modalIssuedInput = modal.querySelector('.modal-issued__input')
  modalIssuedInput.addEventListener('input', e => {
    activateOnInput(e, 'issued-ok')
  })

  if (startTime.value.replaceAll('.', '-').split(' ')[0] === today) {
    modalShift.querySelectorAll('option').forEach(option => {
      if (option.value === 'Первая') {
        option.setAttribute('selected', true)
      }
    })
  }

  drawPlots(plotI, userI.value)
  userData.insertAdjacentHTML('beforeend', `
    <option selected value="${userI.value}">${userI.value}</option>
  `)

  okBtn.addEventListener('click', () => {
    issuedInput.value = String(Number(issuedInput.value) + Number(modalIssuedInput.value))
    addReportMsg(`${date.value.replaceAll('-', '.') || today.replaceAll('-', '.')}__${userData.value}__${plot.value}__${modalIssuedInput.value}`, '#visible__comments')
    shift.value = modalShift.value

    if (check) {
      addLog(user.nickname, `${plot.value} За смену ${date.value === today ? '' : date.value} ${userData.value} ${modalIssuedInput.value}`, '#visible__comments')
      console.log(date.value)
      let alreadyInDateCheck = false
      console.log(updateData.length)

      if (date.value !== today) {
        for (let i = 0; i < updateData.length; i++) {
          if (updateData[i].date === date.value) {
            updateData[i].operator = userData.value
            updateData[i].quantity += Number(modalIssuedInput.value)
          }

          console.log(updateData[i])
        }

        if (!alreadyInDateCheck) {
          updateData.push({
            'operator': userData.value,
            'date': date.value,
            'quantity': Number(modalIssuedInput.value)
          })
        }
      } else {
        console.log('TODAY')
        issuedTodayInput.value = Number(issuedTodayInput.value) + Number(modalIssuedInput.value)
      }

    } else {
      issuedTodayInput.value = Number(issuedTodayInput.value) + Number(modalIssuedInput.value)
      addLog(userData.value, `${plot.value} За смену ${modalIssuedInput.value}`, '#visible__comments')
    }

    modal.click()
  })


  cnclBtn.addEventListener('click', () => {
    modal.click()
  })
}
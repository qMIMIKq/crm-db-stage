import {showModal} from "./showModal";
import {addLog, drawPlots} from "./routesModal";
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
        
        <label class='route__label'>Дата</label>
        <input type="date" class="main__button modal-issued__date route__input">
      
        <input 
          type='number'
          class='route__input modal-issued__input text-input main__input main__input'
          name='error_msg' 
          id='error-route__msg'>
        
        <div class='confirm__section'>
            <button class='main__button confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button confirm__button confirm__button--cncl'>Отмена</button>
        </div>
    </div>
   </div>
`

export const issuedHandler = (e, issuedInput, issuedTodayInput, plotI, userI, updateData) => {
  const modal = showModal(changeIssuedModal)
  const okBtn = modal.querySelector('.confirm__button--ok')
  const cnclBtn = modal.querySelector('.confirm__button--cncl')
  const userData = modal.querySelector('.route__select--user')
  const plot = modal.querySelector('.route__select--plot')
  const date = modal.querySelector('.modal-issued__date')

  const check = state.adminCheck || state.techCheck
  let today = getTime()
  today = today.substring(0, today.length - 5)
  let yst = new Date(today)
  yst.setDate(yst.getDate() - 1)
  yst = yst.toISOString().split('T')[0]

  date.setAttribute('max', yst)

  if (!check) {
    userData.classList.add('hidden__input')
    plot.classList.add('hidden__input')
  }

  const modalIssuedInput = modal.querySelector('.modal-issued__input')

  drawPlots(plotI, userI)
  okBtn.addEventListener('click', () => {
    issuedInput.value = String(Number(issuedInput.value) + Number(modalIssuedInput.value))

    if (check) {
      console.log(issuedTodayInput.value)
      addLog(user.nickname, `${plot.value} За смену ${date.value} ${userData.value} ${modalIssuedInput.value}`, '#visible__comments')


      updateData.push({
        'operator_name': userData.value,
        'report_date': date.value ? date.value : today,
        'quantity': modalIssuedInput.value
      })

      if (date.value) {
        console.log('CHECK')
      } else {
        console.log('NOT CHECK')
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
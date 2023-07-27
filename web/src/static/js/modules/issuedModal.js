import {showModal} from "./showModal";
import {addLog, drawPlots} from "./routesModal";
import {user} from "../table";
import {state} from "./state";

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
        <select disabled class='route__select main__button main__select route__select--user' name='user' id='route__user'>
            <option selected disabled>Выберите оператора</option>
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

export const issuedHandler = (e, issuedInput, plotI, userI) => {
  const modal = showModal(changeIssuedModal)
  const okBtn = modal.querySelector('.confirm__button--ok')
  const cnclBtn = modal.querySelector('.confirm__button--cncl')
  const userData = modal.querySelector('.route__select--user')
  const plot = modal.querySelector('.route__select--plot')
  const date = modal.querySelector('.modal-issued__date')

  const check = state.adminCheck || state.techCheck

  if (!check) {
    userData.remove()
    plot.remove()
  }

  const issuedTodayInput = modal.querySelector('.modal-issued__input')

  drawPlots(plotI, userI)
  okBtn.addEventListener('click', () => {
    issuedInput.value = String(Number(issuedInput.value) + Number(issuedTodayInput.value))

    if (check) {
      addLog(user.nickname, `${plot.value} За смену ${date.value} ${userData.value} ${issuedTodayInput.value}`, '#visible__comments')
    } else {
      addLog(user.nickname, `${plot.value} За смену ${issuedTodayInput.value}`, '#visible__comments')
    }

    addLog(user.nickname, `${plot.value} За смену ${date.value} ${userData.value} ${issuedTodayInput.value}`, '#visible__comments')
    modal.click()
  })


  cnclBtn.addEventListener('click', () => {
    modal.click()
  })
}
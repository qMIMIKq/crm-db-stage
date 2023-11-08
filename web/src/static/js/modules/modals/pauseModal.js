import {showModal} from "./showModal";
import {user} from "../../table";
import {activateNextStage, activateOnInput, addLog, setDateToInput} from "./routesModal";
import {state} from "../state";

const changePauseModal = `
  <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
    <div class='modal_content modal-error' style='width: 350px'>
         <div class='modal__header modal-header' style="background:#51a5e3;;">
              <h2 class='comments__title'>Пауза</h2>                
          </div>
        
        <input 
          placeholder="Причина паузы"
          type='text'
          class='route__input modal-error__input text-input main__input main__input'
          name='error_msg' 
          id='error-route__msg'>
        
        <div class='confirm__section'>
            <button disabled class='main__button route__btn confirm__button confirm__button--ok'>Сохранить</button>
            <button disabled class='main__button route__btn confirm__button confirm__button--cncl'>Сброс</button>
        </div>
    </div>
   </div>
`

export const changePauseHandler = (e, errorText, errorTime, operator, doPause) => {
  const modal = showModal(changePauseModal)
  const errInput = modal.querySelector('.modal-error__input')
  const okBtn = modal.querySelector('.confirm__button--ok')
  const cnclBtn = modal.querySelector('.confirm__button--cncl')

  let changed
  errInput.addEventListener('input', e => {
    changed = true
    activateOnInput(e, 'confirm__button--ok')
  })

  if (errorText.value) {
    errInput.value = errorText.value.split('--')[1]
  }

  if (errInput.value) {
    activateNextStage('confirm__button--ok')
    activateNextStage('confirm__button--cncl')
  }

  okBtn.addEventListener('click', () => {
    if (changed) {
      let logName = !state.operCheck ? user.nickname : operator
      errorText.value = `${logName}--${errInput.value}`
      setDateToInput('pause-route__time')
      addLog(logName, `ПАУЗА ${errInput.value}`, '#visible__comments')
    }

    doPause(false)
    modal.click()

    console.log(errorText.value)
  })

  cnclBtn.addEventListener('click', () => {
    errorText.value = ''
    errorTime.value = ''
    addLog(user.nickname, `Сбросил паузу`, '#visible__comments')
    doPause(true)
    modal.click()
  })
}
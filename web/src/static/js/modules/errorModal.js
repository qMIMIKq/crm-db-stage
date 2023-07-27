import {showModal} from "./showModal";
import {user} from "../table";

const changeErrorModal = `
  <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
    <div class='modal_content modal-error' style='width: 350px'>
        <h2 class='confirm__title modal-error__title'>Ошибка</h2>
        
        <input 
          type='text'
          class='route__input modal-error__input text-input main__input main__input'
          name='error_msg' 
          id='error-route__msg'>
        
        <div class='confirm__section'>
            <button class='main__button confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button confirm__button confirm__button--cncl'>Сброс</button>
        </div>
    </div>
   </div>
`

export const changeErrorHandler = (e, errorText, errorTime) => {
  const modal = showModal(changeErrorModal)
  const errInput = modal.querySelector('.modal-error__input')
  const okBtn = modal.querySelector('.confirm__button--ok')
  const cnclBtn = modal.querySelector('.confirm__button--cncl')

  errInput.value = errorText.value

  okBtn.addEventListener('click', () => {
    e.target.classList.add('route-type__error')
    errorText.value = errInput.value
    setDateToInput('error__time')
    addLog(user.nickname, `ОШИБКА ${errInput.value}`, '#visible__comments')
    modal.click()
  })

  cnclBtn.addEventListener('click', () => {
    e.target.classList.remove('route-type__error')
    errorText.value = ''
    errorTime.value = ''
    addLog(user.nickname, `Сбросил ошибку`, '#visible__comments')
    modal.click()
  })
}
import {showModal} from "./showModal";
import {addLog} from "./routesModal";
import {user} from "../../table";

const shiftsModal = `
  <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
    <div class='modal_content' style='width: 390px'>
         <div class='modal__header modal-header'>
              <h2 class='comments__title'>Норма за смену (в минутах)</h2>                
         </div>
          
        <div class="modal_content-block">
          <label class="search-orders__label" for="search-orders__client">УП</label>
          <input 
            autofocus
            placeholder="УП"
            type='number'
            class='route__input search-orders__input main__input'
            name='up' 
            id='up'>
        </div>
        
        <div class="modal_content-block">
        <label class="search-orders__label" for="search-orders__client">Наладка</label>
          <input 
            placeholder="Наладка"
            type='number'
            class='route__input search-orders__input main__input'
            name='adjustment' 
            id='adjustment'>
        </div>
        
        <div class="modal_content-block">
        <label class="search-orders__label" for="search-orders__client">На одну деталь</label>
          <input 
            placeholder="На одну деталь"
            type='number'
            class='route__input search-orders__input main__input'
            name='time' 
            id='time'>
        </div>
        
        <div class='confirm__section'>
            <button class='main__button route__btn confirm__button confirm__button--search'>ОК</button>
        </div>
    </div>
   </div>
`

export const calcWorkingShiftsModal = (dayQuantityInput, dayQuantityInfo, getTheor) => {
  const modal = showModal(shiftsModal)
  const up = modal.querySelector('#up')
  const adjustment = modal.querySelector('#adjustment')
  const time = modal.querySelector('#time')
  const okBtn = modal.querySelector('.confirm__button--search')

  up.focus()

  up.value = dayQuantityInfo.up
  adjustment.value = dayQuantityInfo.adjustment
  time.value = dayQuantityInfo.time

  let check = false

  ;[up, adjustment, time].forEach(input => input.addEventListener('change', () => {
    check = true
  }))

  const defaultWorkTime = 43200

  time.addEventListener('input', e => {
    let check = e.target.value.replaceAll(',', '.')
    let data = check.split('.')
    if (data.length > 1) {
      let newData = data[1].split('')
      check = Number(newData[0]) >= 6
      if (check) {
        e.target.value = data[0]
        alert('Вы вводите неверные данные')
        console.log('error')
      }
    }
  })

  okBtn.addEventListener('click', () => {
    const timeValue = time.value.replaceAll(',', '.')
    let check = timeValue.split('.')
    let seconds = 0
    if (check.length > 1) {
      let rightSplit = check[1].split('')
      if (rightSplit.length === 1) {
        rightSplit = rightSplit[0] * 10
      } else {
        rightSplit = check[1]
      }

      seconds += check[0] * 60 + rightSplit
    } else {
      seconds += check[0] * 60
    }

    console.log(seconds)
    console.log(dayQuantityInfo.quantity)

    // if (dayQuantityInfo.quantity && dayQuantityInfo.quantity != 0) {
    //   if (dayQuantity > dayQuantityInfo.quantity) {
    //     dayQuantityInput.value = dayQuantity.quantity
    //   } else {
    //     dayQuantityInput.value = Math.floor(defaultWorkTime / seconds)
    //   }
    //
    // } else {
    //   dayQuantityInput.value = Math.floor(defaultWorkTime / seconds)
    // }

    dayQuantityInput.value = Math.floor(defaultWorkTime / seconds)

    dayQuantityInfo.up = Number(up.value)
    dayQuantityInfo.adjustment = Number(adjustment.value)
    dayQuantityInfo.time = Number(timeValue)

    console.log(time.value)
    if (dayQuantityInfo.time && check) {
      addLog(user.nickname, `Установил УП  ${dayQuantityInfo.up} Наладка ${dayQuantityInfo.adjustment} На деталь ${time.value.replaceAll('.', ',')}`, '#visible__comments')
      getTheor()
    }

    modal.click()
  })
}
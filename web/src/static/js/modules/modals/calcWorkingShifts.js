import {showModal} from "./showModal";

const shiftsModal = `
  <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
    <div class='modal_content' style='width: 390px'>
         <div class='modal__header modal-header'>
              <h2 class='comments__title'>Норма за смену</h2>                
          </div>
          
        <div class="modal_content-block">
          <label class="search-orders__label" for="search-orders__client">УП</label>
          <input 
            placeholder="Клиент"
            type='text'
            class='route__input search-orders__input main__input'
            name='client' 
            id='search-orders__client'>
        </div>
        
        <div class="modal_content-block">
        <label class="search-orders__label" for="search-orders__client">Наладка</label>
          <input 
            placeholder="Наименование"
            type='text'
            class='route__input search-orders__input main__input'
            name='name' 
            id='search-orders__name'>
        </div>
        
        <div class="modal_content-block">
        <label class="search-orders__label" for="search-orders__client">На одну деталь</label>
          <input 
            placeholder="Материал"
            type='text'
            class='route__input search-orders__input main__input'
            name='material' 
            id='search-orders__material'>
        </div>
        
        <div class='confirm__section'>
            <button class='main__button route__btn confirm__button confirm__button--search'>ОК</button>
            <button class='main__button route__btn confirm__button confirm__button--search'>Отмена</button>
        </div>
    </div>
   </div>
`

export const calcWorkingShifts = () => {
  const modal = showModal(shiftsModal)
}
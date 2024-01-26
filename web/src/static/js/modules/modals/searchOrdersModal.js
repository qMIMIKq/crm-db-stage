import {showModal} from "./showModal";
import {state} from "../state";
import {newAllFilter} from "../filters/newAllFilter";

const searchOrdersModal = `
  <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
    <div class='modal_content' style='width: 390px'>
         <div class='modal__header modal-header'>
              <h2 class='comments__title'>Поиск заказов</h2>                
          </div>
          
          
        <div class="modal_content-block">
          <label class="search-orders__label" for="search-orders__client">Везде</label>
          <input 
            placeholder="Полный поиск"
            type='text'
            class='route__input search-orders__input main__input'
            name='every' 
            id='search-orders__every'>
        </div>
        
        <div class="modal_content-block">
        <label class="search-orders__label" for="search-orders__client">Строка</label>
          <input 
            placeholder="Строка"
            type='number'
            class='route__input search-orders__input main__input'
            name='id' 
            id='search-orders__number'>
        </div>
        
        <div class="modal_content-block">
        <label class="search-orders__label" for="search-orders__client">№ Заказа</label>
          <input 
            placeholder="№ Заказа"
            type='text'
            class='route__input search-orders__input main__input'
            name='number' 
            id='search-orders__number'>
        </div>
          
        <div class="modal_content-block">
          <label class="search-orders__label" for="search-orders__client">Клиент</label>
          <input 
            placeholder="Клиент"
            type='text'
            class='route__input search-orders__input main__input'
            name='client' 
            id='search-orders__client'>
        </div>
        
<!--        <div class="modal_content-block">-->
<!--        <label class="search-orders__label" for="search-orders__client">Наименование</label>-->
          <input 
            placeholder="Наименование"
            type='text'
            class='route__input hidden-input search-orders__input main__input'
            name='name' 
            id='search-orders__name'>
<!--        </div>-->
        
<!--        <div class="modal_content-block">-->
<!--        <label class="search-orders__label" for="search-orders__client">Материал</label>-->
          <input 
            placeholder="Материал"
            type='text'
            class='route__input hidden-input search-orders__input main__input'
            name='material' 
            id='search-orders__material'>
<!--        </div>-->
        
        <div class='confirm__section'>
            <button class='main__button route__btn confirm__button confirm__button--search'>Найти</button>
        </div>
    </div>
   </div>
`

export const searchOrdersHandler = () => {
    const searchModal = showModal(searchOrdersModal)
    const inputs = searchModal.querySelectorAll('input')

    const everySearch = searchModal.querySelector('#search-orders__every')
    everySearch.focus()

    everySearch.addEventListener('input', e => {
        inputs.forEach(input => {
            if (e.target.value !== '' && input !== e.target) {
                state['tableFilters'][input.name] = ''
                input.value = ''
                input.setAttribute('disabled', true)
                input.setAttribute('readonly', true)
            } else {
                input.removeAttribute('disabled')
                input.removeAttribute('readonly')
            }
        })
    })

    const searchBtn = searchModal.querySelector('.confirm__button--search')
    searchBtn.addEventListener('click', () => {
        inputs.forEach(input => {
            if (input.value) {
                state['filtered'] = true
                state['searched'] = true
                state['tableFilters'][input.name] = input.value
            }
        })

        searchModal.click()
        newAllFilter()
    })
}
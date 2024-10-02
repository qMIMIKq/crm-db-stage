import {showModal} from "./showModal";

const globalTableRoutesFilterModal = `
  <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
    <div class='modal_content' style='width: 390px'>
        <div class='modal__header modal-header'>
              <h2 class='comments__title'>Сборный фильтр</h2>                
        </div>
          
        <div class="modal_content-block__global-wrapper">
            <div class="modal_content-block__global global__status">
              <h3>Статус</h3>
              <ul class="global__status-list status__list">
                <li class="status__list-item">
                    В работе
                    <div class="hidden-input route-status__btn--value">started-#e06c00</div>
                    <div class="hidden-input route-status__btn--text">В работе</div>
                </li>
                <li class="status__list-item">
                    Не в работе
                    <div class="hidden-input route-status__btn--value">unstarted-#6b6666</div>
                    <div class="hidden-input route-status__btn--text">Не в работе</div>
                </li>
                <li class="status__list-item">
                    Ошибка
                    <div class="hidden-input route-status__btn--value">error-#d24242</div>
                    <div class="hidden-input route-status__btn--text">Ошибка</div>
                </li>
                <li class="status__list-item">
                    Пауза
                    <div class="hidden-input route-status__btn--value">paused-#51a5e3</div>
                    <div class="hidden-input route-status__btn--text">Пауза</div>
                </li>
                <li class="status__list-item">
                    Сдал
                    <div class="hidden-input route-status__btn--value">completed-#00821d</div>
                    <div class="hidden-input route-status__btn--text">Сдал</div>
                </li>
                <li class="status__list-item">
                    Не выполнено
                    <div class="hidden-input route-status__btn--value">uncompleted-#43000a24</div>
                    <div class="hidden-input route-status__btn--text">Не выполнено</div>
              </ul>
            </div>
            
            <div class="modal_content-block__global global__warning">
              <h3>Внимание</h3>
              <ul class="global__status-list status__list">
                <li class="status__list-item">
                    Красный
                    <div class="hidden-input route-warning__btn--value">red</div>
                    <div class="hidden-input route-warning__btn--text">Красный</div>
                </li>
                <li class="status__list-item">
                    Синий
                    <div class="hidden-input route-warning__btn--value">blue</div>
                    <div class="hidden-input route-warning__btn--text">Синий</div>
                </li>
                <li class="status__list-item">
                    Жёлтый
                    <div class="hidden-input route-warning__btn--value">#e5e516</div>
                    <div class="hidden-input route-warning__btn--text">Жёлтый</div>
                </li>
              </ul>
          </div>    
              
        </div>
        
        <div class="modal_content-block__global global__plan">
            <div class="route-plan__block">
                <button tabindex="-1" class="main__button--click header-routes__filter header-routes__planned">В
                    плане
                </button>
                <input tabindex="-1" type="date"
                       class="main__button--click header-routes__filter header-routes__planned-date">
            </div>
        </div>
        
        <div class='confirm__section'>
            <button class='main__button route__btn confirm__button confirm__button--search'>Найти</button>
        </div>
    </div>
   </div>
`


export const globalRoutesFilterHandler = e => {
  const modal = showModal(globalTableRoutesFilterModal)
}
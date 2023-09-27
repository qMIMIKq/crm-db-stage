import {showModal} from "../modals/showModal"
import {appAddr} from "../state";
import {ucFirst} from "../../ucFirst";
import {sendData} from "../sendData";
import {drawUsers} from "./users";
import {drawGroups} from "./groups";
import {drawAdminPlots} from "./drawPlots";
import {drawAdminFilters} from "./filters";

const mainAdminModal = `
  <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
    <div class='admin-panel modal_content modal-error'>
          <div class='modal__header modal-header'>
              <h2 class='comments__title'>Админстрирование системы</h2>                
          </div>
        
         <div class="admin-panel__nav panel-nav">
            <ul class="panel-nav__navigation nav-navigation">
<!--                <li class="nav-navigation__item nav-navigation__item&#45;&#45;title">-->
<!--                   Меню-->
<!--                </li>-->
            
                <li class="nav-navigation__item">
                    <div class="nav-navigation__text nav-navigation__users">Пользователи</div>
                    <button class="nav-navigation__add main__button route__btn nav-navigation__users-add">Добавить</button>
                </li>
                <li class="nav-navigation__item">
                    <div class="nav-navigation__text nav-navigation__groups">Группы</div>
                </li>
                <li class="nav-navigation__item">
                    <div class="nav-navigation__text nav-navigation__plots">Участки</div>
                    <button class="nav-navigation__add main__button route__btn nav-navigation__plots-add">Добавить</button>
                </li>
                <li class="nav-navigation__item">
                    <div class="nav-navigation__text nav-navigation__filters">Фильтры</div>
                    <button class="nav-navigation__add main__button route__btn nav-navigation__filters-add">Добавить</button>
                </li>
                <li class="nav-navigation__item">
                    <div class="nav-navigation__text">Конструктор фильтров</div>
                </li>
            </ul>
            <div class="panel-nav__content nav-content">
                
                
            </div>
         </div>
        </div>
   </div>
`


const getAndDrawData = (url, drawFunc, modal) => {
  const contentPlace = modal.querySelector('.nav-content')
  try {
    contentPlace.querySelector('.nav-content__columns').remove()
    contentPlace.querySelector('.nav-content__items').remove()
    contentPlace.querySelector('.edit-form').remove()
  } catch {}


  contentPlace.insertAdjacentHTML('beforeend', `<ul class="nav-content__columns"></ul>`)
  contentPlace.insertAdjacentHTML('beforeend', `<ul class="nav-content__items"></ul>`)

  fetch(`${appAddr}/api/${url}`)
    .then(res => res.json())
    .then(data => {
      console.log(data.data)
      drawFunc(modal, data.data)
    })
}

export const adminHandler = () => {
  const adminModalBtn = document.querySelector('.nav-control__admin')


  adminModalBtn.addEventListener('click', () => {
    const adminModal = showModal(mainAdminModal)
    const usersBtn = adminModal.querySelector('.nav-navigation__users')
    const groupsBtn = adminModal.querySelector('.nav-navigation__groups')
    const plotBtn = adminModal.querySelector('.nav-navigation__plots')
    const filtersBtn = adminModal.querySelector('.nav-navigation__filters')

    const contentPlace = adminModal.querySelector('.nav-content')


    usersBtn.addEventListener('click', () => {
      getAndDrawData('users/get-all', drawUsers, adminModal)
    })

    groupsBtn.addEventListener('click', () => {
      getAndDrawData('groups/get-all', drawGroups, adminModal)
    })

    plotBtn.addEventListener('click', () => {
      getAndDrawData('plots/get-all', drawAdminPlots, adminModal)
    })

    filtersBtn.addEventListener('click', () => {
      getAndDrawData('filters/get-all', drawAdminFilters, adminModal)
      console.log('hi')
    })
  })
}
import {showModal} from "../modals/showModal"
import {appAddr} from "../state";
import {drawUsers} from "./users";
import {drawGroups} from "./groups";
import {drawAdminPlots} from "./drawPlots";
import {drawAdminFilters} from "./filters";
import {drawConstructor} from "./constructor";
import {userAdd} from "./userAdd";
import {filterAdd} from "./filterAdd";
import {plotAdd} from "./plotAdd";

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
                    <div class="nav-navigation__text nav-navigation__constructor">Конструктор фильтров</div>
                </li>
            </ul>
            <div class="panel-nav__content nav-content">
                
                
            </div>
         </div>
        </div>
   </div>
`


export const getAndDrawData = (url, drawFunc, modal, current) => {
  console.log(current)
  let contentPlace = modal.querySelector('.nav-content')
  try {
    contentPlace.remove()
    modal.querySelector('.panel-nav').insertAdjacentHTML('beforeend', `<div class="panel-nav__content nav-content"></div>`)
  } catch {
  }

  contentPlace = modal.querySelector('.nav-content')
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
    document.querySelector('.nav-control').classList.toggle('nav-control--opened')
    document.querySelector('.nav-control__routes').classList.toggle('hidden__input')
    adminModalBtn.classList.add('hidden-input')

    const adminModal = showModal(mainAdminModal)
    const usersBtn = adminModal.querySelector('.nav-navigation__users')
    const groupsBtn = adminModal.querySelector('.nav-navigation__groups')
    const plotBtn = adminModal.querySelector('.nav-navigation__plots')
    const filtersBtn = adminModal.querySelector('.nav-navigation__filters')
    const constructorBtn = adminModal.querySelector('.nav-navigation__constructor')

    const userAddBtn = adminModal.querySelector('.nav-navigation__users-add')
    userAddBtn.addEventListener('click', () => {
      userAdd(adminModal)
    })

    const plotAddBtn = adminModal.querySelector('.nav-navigation__plots-add')
    plotAddBtn.addEventListener('click', () => {
      plotAdd(adminModal)
    })

    const filterAddBtn = adminModal.querySelector('.nav-navigation__filters-add')
    filterAddBtn.addEventListener('click', () => {
      filterAdd(adminModal)
    })

    usersBtn.addEventListener('click', e => {
      try {
        adminModal.querySelector('.nav-content__columns').remove()
        adminModal.querySelector('.nav-content__items').remove()
        adminModal.querySelector('.edit-form').remove()
      } catch {
      }
      getAndDrawData('users/get-all', drawUsers, adminModal, e.target)
    })

    groupsBtn.addEventListener('click', e => {
      try {
        adminModal.querySelector('.nav-content__columns').remove()
        adminModal.querySelector('.nav-content__items').remove()
        adminModal.querySelector('.edit-form').remove()
      } catch {
      }
      getAndDrawData('groups/get-all', drawGroups, adminModal, e.target)
    })

    plotBtn.addEventListener('click', e => {
      try {
        adminModal.querySelector('.nav-content__columns').remove()
        adminModal.querySelector('.nav-content__items').remove()
        adminModal.querySelector('.edit-form').remove()
      } catch {
      }
      getAndDrawData('plots/get-all', drawAdminPlots, adminModal, e.target)
    })

    filtersBtn.addEventListener('click', e => {
      try {
        adminModal.querySelector('.nav-content__columns').remove()
        adminModal.querySelector('.nav-content__items').remove()
        adminModal.querySelector('.edit-form').remove()
      } catch {
      }
      getAndDrawData('filters/get-all-hidden', drawAdminFilters, adminModal, e.target)
      console.log('hi')
    })

    constructorBtn.addEventListener('click', e => {
      try {
        adminModal.querySelector('.nav-content__columns').remove()
        adminModal.querySelector('.nav-content__items').remove()
        adminModal.querySelector('.edit-form').remove()
      } catch {
      }
      getAndDrawData('filters/get-all', drawConstructor, adminModal, e.target)
    })
  })
}
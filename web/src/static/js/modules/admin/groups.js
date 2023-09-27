import {ucFirst} from "../../ucFirst";
import {sendData} from "../sendData";
import {appAddr} from "../state";

export const drawGroups = (modal, datas) => {
  const navContent = modal.querySelector('.nav-content')
  const topColumns = modal.querySelector('.nav-content__columns')
  const itemColumns = modal.querySelector('.nav-content__items')

  topColumns.classList.remove('hidden-input')
  itemColumns.classList.remove('hidden-input')

  topColumns.insertAdjacentHTML('afterbegin', `
    <li class="nav-content__column users-columns__name">
        Группа
    </li>
    <li class="nav-content__column users-columns__nickname">
        Описание
    </li>
  `)

  datas.forEach(data => {
    itemColumns.insertAdjacentHTML('beforeend', `
      <li class="nav-content__item nav-item">
          <div class="nav-item__column users-item__name">
              <div class="nav-item__column--edit">
                <input class="hidden-input" type="text" value="${data.id}">
                ${data.name}
            </div>
          </div>
          </div>
          <div class="nav-item__column users-item__name">${data.description}</div>
      </li>
    `)
  })

  modal.querySelectorAll('.nav-item__column--edit').forEach(editor => {
    editor.addEventListener('click', () => {
      const userID = editor.querySelector('.hidden-input').value

      sendData(`${appAddr}/api/groups/get-group`, 'POST', JSON.stringify({'id': userID}))
        .then(data => {
          return data.json()
        })
        .then(data => {
          topColumns.classList.add('hidden-input')
          itemColumns.classList.add('hidden-input')

          const d = data.data

          navContent.insertAdjacentHTML('afterbegin', `
            <form class="edit__form edit__form--group edit-form edit-form--group" method="post">
<!--              <h3 class="edit-form__title">Изменение пользователя ${d.name}</h3>-->
              <input class="hidden__input" type="text" id="id" name="id" value="${d.id}">
              
              <div class="edit-form__user">
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Название</label>
                    <input id="name" class="route__input edit-form__input edit-form__name" name="name" type="text"
                           value="${d.name}">
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="login">Описание</label>
                      <textarea class="route__input edit-form__text" name="description" id="description">${d.description}</textarea>
                  </div>
      
                  <div class="edit-form__block">
                      <button class="section-finish__btn section-finish__sub edit-form__submit" type="submit">Сохранить</button>
                  </div>
              </div>
        </form>
        `)
        })
    })
  })
}
import {sendData} from "../sendData";
import {appAddr} from "../state";

export const drawAdminPlots = (modal, datas) => {
  const navContent = modal.querySelector('.nav-content')
  const topColumns = modal.querySelector('.nav-content__columns')
  const itemColumns = modal.querySelector('.nav-content__items')

  topColumns.classList.remove('hidden-input')
  itemColumns.classList.remove('hidden-input')

  topColumns.insertAdjacentHTML('afterbegin', `
    <li class="nav-content__column nav-content__column--left users-columns__name">
        Участок
    </li>
    <li class="nav-content__column nav-content__column--left users-columns__nickname">
        Никнейм
    </li>
  `)

  datas.forEach(data => {
    console.log(data)

    itemColumns.insertAdjacentHTML('beforeend', `
      <li class="nav-content__item nav-item">
          <div class="nav-item__column nav-item__column--left users-item__name">
              <div class="nav-item__column--edit">
                <input class="hidden-input" type="text" value="${data.id}">
                ${data.name}
            </div>
          </div>
          </div>
          <div class="nav-item__column nav-item__column--left users-item__name">${data.short_name}</div>
      </li>
    `)
  })

  modal.querySelectorAll('.nav-item__column--edit').forEach(editor => {
    editor.addEventListener('click', () => {
      const userID = editor.querySelector('.hidden-input').value

      sendData(`${appAddr}/api/plots/get-plot`, 'POST', JSON.stringify({'id': userID}))
        .then(data => {
          return data.json()
        })
        .then(data => {
          topColumns.classList.add('hidden-input')
          itemColumns.classList.add('hidden-input')

          const d = data.data

          navContent.insertAdjacentHTML('afterbegin', `
            <form class="edit__form edit__form--group edit-form edit-form--group" method="post" style="height: 265px">
<!--              <h3 class="edit-form__title">Изменение пользователя ${d.name}</h3>-->
              <input class="hidden__input" type="text" id="id" name="id" value="${d.id}">
              
              <div class="edit-form__user">
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Участок</label>
                    <input id="name" class="route__input edit-form__input edit-form__name" name="name" type="text"
                           value="${d.name}">
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="login">Никнейм</label>
                      <input id="login" class="route__input edit-form__input edit-form__login" name="short_name" type="text"
                             value="${d.short_name}">
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
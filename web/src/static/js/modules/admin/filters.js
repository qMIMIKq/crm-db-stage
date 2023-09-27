import {sendData} from "../sendData";
import {appAddr} from "../state";

export const drawAdminFilters = (modal, datas) => {
  const navContent = modal.querySelector('.nav-content')
  const topColumns = modal.querySelector('.nav-content__columns')
  const itemColumns = modal.querySelector('.nav-content__items')

  topColumns.classList.remove('hidden-input')
  itemColumns.classList.remove('hidden-input')

  topColumns.insertAdjacentHTML('afterbegin', `
    <li class="nav-content__column users-columns__name">
        Фильтр
    </li>
    <li class="nav-content__column users-columns__nickname">
        Участок
    </li>
    <li class="nav-content__column users-columns__nickname">
        Скрыт
    </li>
  `)

  datas.forEach(data => {
    console.log(data)

    itemColumns.insertAdjacentHTML('beforeend', `
      <li class="nav-content__item nav-item">
          <div class="nav-item__column users-item__name">
              <div class="nav-item__column--edit">
                <input class="hidden-input" type="text" value="${data.id}">
                ${data.name}
            </div>
          </div>
          </div>
          <div class="nav-item__column users-item__name">${data.plot}</div>
          <div class="nav-item__column users-item__name">${data.disable ? 'Да' : 'Нет'}</div>
      </li>
    `)
  })

  modal.querySelectorAll('.nav-item__column--edit').forEach(editor => {
    editor.addEventListener('click', () => {
      const userID = editor.querySelector('.hidden-input').value

      sendData(`${appAddr}/api/filters/get-filter`, 'POST', JSON.stringify({'id': userID}))
        .then(data => {
          return data.json()
        })
        .then(data => {
          topColumns.classList.add('hidden-input')
          itemColumns.classList.add('hidden-input')

          const d = data.data

          navContent.insertAdjacentHTML('afterbegin', `
            <form class="edit__form edit__form--group edit-form edit-form--group" method="post" style="height: 446px">
<!--              <h3 class="edit-form__title">Изменение пользователя ${d.name}</h3>-->
              <input class="hidden__input" type="text" id="id" name="id" value="${d.id}">
              
              <div class="edit-form__user">
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Фильтр</label>
                    <input id="name" class="route__input edit-form__input edit-form__name" name="name" type="text"
                           value="${d.name}">
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="login">Участки</label>
                      <select class="route__select edit-form__input edit-form__plot" name="plot_id" id="plot">
                          <option value="${d.plot_id}">${d.plot}</option>
                      </select>
                  </div>
                  
                  <div class="edit-form__block edit-form__block--checker">
                      <label class="edit-form__label edit-form__label--checker" for="disable">Скрыть</label>
                      <input ${d.disable ? 'checked' : ''} id="disable" class="" name="disable" type="checkbox">
                  </div>        
                  
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Начало работы</label>
                    <input id="name" class="route__input edit-form__input edit-form__name" name="start_time" type="time"
                           value="${d.start_time}">
                  </div>
                  
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Конец работы</label>
                    <input id="name" class="route__input edit-form__input edit-form__name" name="d.end_time" type="time"
                           value="${d.end_time}">
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
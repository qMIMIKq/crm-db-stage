import {sendData} from "../sendData";
import {appAddr} from "../../../../../../appAddr";
import {topFiltersHandler} from "../filters/topFilters";

export const userAdd = (modal) => {
  let ok = false
  let err = false

  const contentPlace = modal.querySelector('.nav-content')
  const adminPanel = modal.querySelector(".admin-panel__nav")
  contentPlace.remove()
  adminPanel.insertAdjacentHTML('beforeend', `
    <div class="panel-nav__content nav-content"></div>
  `)


  const navContent = modal.querySelector('.nav-content')
  navContent.insertAdjacentHTML('afterbegin', `
            <form class="edit__form edit-form" method="post">
              <div class="edit-form__user">
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Имя</label>
                    <input style="cursor: text;" required id="name" class="route__input edit-form__input edit-form__name" name="name" type="text">
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="login">Логин</label>
                      <input style="cursor: text;" required id="login" class="route__input edit-form__input edit-form__login" name="login" type="text">
                  </div>
      
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="nickname">Никнейм</label>
                      <input style="cursor: text;" required id="nickname" class="route__input edit-form__input edit-form__name" name="nickname" type="text">
                  </div>
              </div>
              
  
              <div class="edit-form__status">
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="group">Группа</label>
                    <select required class="route__select edit-form__input edit-form__group" name="group_id" id="group">
                    </select>
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="plot">Участки</label>
                      <select required class="route__select edit-form__input edit-form__plot" name="plot_id" id="plot">
                      </select>
                  </div>
      
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="password">Пароль</label>
                      <input style="cursor: text;" required id="password" class="route__input edit-form__input edit-form__name" name="password" type="password">
                  </div>
      
                  <div class="edit-form__block">
                      <button class="section-finish__btn section-finish__sub edit-form__submit" type="submit">Сохранить</button>
                  </div>
              </div>
        </form>
        `)

  const editGroup = document.querySelector(".edit-form__group")
  const editPlot = document.querySelector(".edit-form__plot")
  const drawData = (url, block) => {
    fetch(`${appAddr}/api/${url}`)
      .then(res => res.json())
      .then(data => {
        data.data.forEach(group => {
          block.insertAdjacentHTML("beforeend", `
              <option value="${group.id}">${group.name}</option>
          `)
        })
      })
  }
  drawData("groups/get-all", editGroup)
  drawData("plots/get-all", editPlot)

  const editForm = modal.querySelector('.edit__form')
  editForm.addEventListener('submit', e => {
    e.preventDefault()

    const formData = new FormData(editForm)
    const obj = {}

    formData.forEach(((value, key) => {
      switch (key) {
        case "id":
          obj[key] = Number(value)
          break
        default:
          obj[key] = value.trim()
      }
    }))

    sendData(`${appAddr}/api/users/add`, 'POST', JSON.stringify(obj))
      .then(res => {
        if (res.ok) {
          editForm.reset()
          if (!ok) {
            ok = true
            editForm.insertAdjacentHTML('beforeend', `
              <div class="edit-form__succ edit-form__succ--user">
                  <h3>Пользователь успешно добавлен</h3>
              </div>
            `)
          }

          topFiltersHandler()
          setTimeout(() => {
            editForm.querySelector('.edit-form__succ').remove()
            ok = false
          }, 1000)
        }
      })
  })
}
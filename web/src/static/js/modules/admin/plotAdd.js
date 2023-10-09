import {sendData} from "../sendData";
import {appAddr} from "../../../../../../appAddr";
import {topFiltersHandler} from "../filters/topFilters";

export const plotAdd = modal => {
  let ok = false
  let err = false
  const navContent = modal.querySelector('.nav-content')

  try {
    navContent.querySelector('.nav-content__columns').remove()
    navContent.querySelector('.nav-content__items').remove()
    navContent.querySelector('.edit-form').remove()
  } catch {
  }

  navContent.insertAdjacentHTML('afterbegin', `
      <form class="edit__form edit__form--group edit-form edit-form--group" method="post" style="height: 265px">
          <div class="edit-form__user">
              <div class="edit-form__block">
                <label class="edit-form__label" for="name">Участок</label>
                <input required id="name" class="route__input edit-form__input edit-form__name" name="name" type="text">
              </div>
  
              <div class="edit-form__block">
                  <label class="edit-form__label" for="login">Короткое имя</label>
                  <input required id="login" class="route__input edit-form__input edit-form__login" name="short_name" type="text">
              </div>
  
              <div class="edit-form__block">
                  <button class="section-finish__btn section-finish__sub edit-form__submit" type="submit">Сохранить</button>
              </div>
          </div>
        </form>
  `)

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
        case 'disable':
          console.log(value)
          break
        default:
          obj[key] = value.trim()
      }
    }))

    const subBtn = editForm.querySelector('.edit-form__submit')
    sendData(`${appAddr}/api/plots/add`, 'POST', JSON.stringify(obj))
      .then(res => {
        if (res.ok) {
          editForm.reset()
          if (!ok) {
            ok = true
            editForm.insertAdjacentHTML('beforeend', `
              <div class="edit-form__succ edit-form__succ--filter">
                  <h3>Участок успешно добавлен</h3>
              </div>
            `)
            editForm.style.height = '299px'
            subBtn.style.marginTop = '65px'
          }

          topFiltersHandler()
          setTimeout(() => {
            editForm.querySelector('.edit-form__succ').remove()
            ok = false
            editForm.style.height = '265px'
            subBtn.style.marginTop = '20px'
          }, 1000)
        }

        return res.json()
      }).then(data => {
      console.log(data)
    })
  })
}
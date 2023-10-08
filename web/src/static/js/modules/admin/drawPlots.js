import {sendData} from "../sendData";
import {appAddr} from "../appAddr";
import {ucFirst} from "../../ucFirst";

export const drawAdminPlots = (modal, datas) => {
  let ok = false

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
        Короткое имя
    </li>
  `)

  datas.forEach(data => {
    console.log(data)

    itemColumns.insertAdjacentHTML('beforeend', `
      <li class="nav-content__item nav-item">
          <div class="nav-item__column nav-item__column--left users-item__name">
              <div class="nav-item__column--edit">
                <input class="hidden-input" type="text" value="${data.id}">
                ${ucFirst(data.name)}
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
                    <input style="cursor: text" required id="name" class="route__input edit-form__input edit-form__name" name="name" type="text"
                           value="${d.name}">
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="login">Короткое имя</label>
                      <input style="cursor: text;" required id="login" class="route__input edit-form__input edit-form__login" name="short_name" type="text"
                             value="${d.short_name}">
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

            console.log(obj)

            const subBtn = editForm.querySelector('.edit-form__submit')
            sendData(`${appAddr}/api/plots/edit`, 'PUT', JSON.stringify(obj))
              .then(res => {
                if (res.ok) {
                  editForm.reset()
                  if (!ok) {
                    ok = true
                    editForm.insertAdjacentHTML('beforeend', `
                      <div class="edit-form__succ edit-form__succ--filter">
                          <h3>Участок успешно изменён</h3>
                      </div>
                    `)
                    editForm.style.height = '299px'
                    subBtn.style.marginTop = '65px'
                  }

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
        })
    })
  })
}
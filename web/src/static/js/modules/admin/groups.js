import {sendData} from "../sendData";
import {appAddr} from "../appAddr";

export const drawGroups = (modal, datas) => {
  let ok = false
  let err = false

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
                        <input style="cursor: default;" readonly style="cursor: default" id="name" class="route__input edit-form__input edit-form__name" name="name" type="text"
                               value="${d.name}">
                      </div>
      
                      <div class="edit-form__block">
                          <label class="edit-form__label" for="login">Описание</label>
                          <textarea style="cursor: text" class="route__input edit-form__text" name="description" id="description">${d.description}</textarea>
                      </div>
          
                      <div class="edit-form__block">
                          <button class="section-finish__btn section-finish__sub edit-form__submit" type="submit">Сохранить</button>
                      </div>
                  </div>
              </form>
          `)


          const editForm = modal.querySelector('.edit__form')
          const subBtn = editForm.querySelector('.edit-form__submit')
          editForm.addEventListener('submit', e => {
            e.preventDefault()

            const formData = new FormData(editForm)
            const obj = {}

            formData.forEach((value, key) => {
              switch (key) {
                case "id":
                  obj[key] = Number(value)
                  break
                default:
                  obj[key] = value.trim()
              }
            })

            sendData(`${appAddr}/api/groups/edit`, 'PUT', JSON.stringify(obj))
              .then(resp => {
                if (resp.ok) {
                  if (!ok) {
                    ok = true
                    editForm.insertAdjacentHTML('beforeend', `
                      <div class="edit-form__succ edit-form__succ--group">
                          <h3>Группа успешно изменена</h3>
                      </div>
                    `)
                    editForm.style.height = '361px'
                    subBtn.style.marginTop = '65px'
                  }

                  setTimeout(() => {
                    editForm.querySelector('.edit-form__succ').remove()
                    ok = false
                    editForm.style.height = '320px'
                    subBtn.style.marginTop = '20px'
                  }, 1000)
                }

                return resp.json()
              })
              .then(data => {

              })

          })


        })
    })
  })
}
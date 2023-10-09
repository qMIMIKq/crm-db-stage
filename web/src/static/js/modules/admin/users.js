import {ucFirst} from "../../ucFirst";
import {sendData} from "../sendData";
import {appAddr} from "../../../../../../appAddr";

export const drawUsers = (modal, users) => {
  let err = false
  let ok = false

  const navContent = modal.querySelector('.nav-content')
  const topColumns = modal.querySelector('.nav-content__columns')
  const itemColumns = modal.querySelector('.nav-content__items')

  topColumns.classList.remove('hidden-input')
  itemColumns.classList.remove('hidden-input')

  topColumns.insertAdjacentHTML('afterbegin', `
    <li class="nav-content__column users-columns__name">
        Имя
    </li>
    <li class="nav-content__column users-columns__nickname">
        Никнейм
    </li>
    <li class="nav-content__column users-columns__group">
        Группа
    </li>
    <li class="nav-content__column users-columns__plots">
        Участки
    </li>
    <li class="nav-content__column users-columns__plots">
        Скрыт
    </li>
  `)

  users.forEach(user => {
    itemColumns.insertAdjacentHTML('beforeend', `
      <li class="nav-content__item nav-item">
          <div class="nav-item__column users-item__name">
              <div class="nav-item__column--edit">
                <input class="hidden-input" type="text" value="${user.id}">
                ${user.name}
            </div>
          </div>
          </div>
          <div class="nav-item__column users-item__name">${user.nickname}</div>
          <div class="nav-item__column users-item__group">${ucFirst(user.group)}</div>
          <div class="nav-item__column users-item__plot">${user.plot}</div>
          <div class="nav-item__column users-item__disabled">
              ${user.disable ? 'Да' : 'Нет'}
          </div>
      </li>
    `)
  })

  modal.querySelectorAll('.nav-item__column--edit').forEach(editor => {
    editor.addEventListener('click', () => {
      const userID = editor.querySelector('.hidden-input').value

      sendData(`${appAddr}/api/users/get-user`, 'POST', JSON.stringify({'id': userID}))
        .then(data => {
          return data.json()
        })
        .then(data => {
          topColumns.classList.add('hidden-input')
          itemColumns.classList.add('hidden-input')

          const user = data.data

          navContent.insertAdjacentHTML('afterbegin', `
            <form class="edit__form edit-form" method="post">
<!--              <h3 class="edit-form__title">Изменение пользователя ${user.name}</h3>-->
              <input class="hidden__input" type="text" id="id" name="id" value="${user.id}">
              
              <div class="edit-form__user">
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Имя</label>
                    <input style="cursor: text;" required id="name" class="route__input edit-form__input edit-form__name" name="name" type="text"
                           value="${user.name}">
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="login">Логин</label>
                      <input style="cursor: text;" required id="login" class="route__input edit-form__input edit-form__login" name="login" type="text"
                             value="${user.login}">
                  </div>
      
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="nickname">Никнейм</label>
                      <input style="cursor: text;" required id="nickname" class="route__input edit-form__input edit-form__name" name="nickname" type="text"
                             value="${user.nickname}">
                  </div>
      
                  <div class="edit-form__block edit-form__block--checker">
                      <label class="edit-form__label edit-form__label--checker" for="disable">Скрыть</label>
                      <input style="cursor: pointer" ${user.disable ? 'checked' : ''} id="disable" class="" name="disable" type="checkbox">
                  </div>        
              </div>
              
  
              <div class="edit-form__status">
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="group">Группа</label>
                    <select required class="route__select edit-form__input edit-form__group" name="group_id" id="group">
                        <option value="${user.group_id}">${user.group}</option>
                    </select>
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="plot">Участки</label>
                      <select required class="route__select edit-form__input edit-form__plot" name="plot_id" id="plot">
                          <option value="${user.plot_id}">${user.plot}</option>
                      </select>
                  </div>
      
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="password">Новый пароль</label>
                      <input style="cursor: text;" id="password" class="route__input edit-form__input edit-form__name" name="password" type="password">
                  </div>
      
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="password_repeat">Повторите новый пароль</label>
                      <input style="cursor: text;" id="password_repeat" class="route__input edit-form__input edit-form__name" name="password_repeat"
                             type="password">
                  </div>
      
                  <div class="edit-form__block">
                      <button class="section-finish__btn section-finish__sub edit-form__submit" type="submit">Сохранить</button>
                  </div>
              </div>
        </form>
        `)

          const editGroup = document.querySelector(".edit-form__group")
          const userGroup = document.querySelector(".edit-form__group option").textContent
          const editPlot = document.querySelector(".edit-form__plot")
          const userPlot = document.querySelector(".edit-form__plot option").textContent

          const drawData = (url, block, userData) => {
            fetch(`${appAddr}/api/${url}`)
              .then(res => res.json())
              .then(data => {
                data.data.forEach(group => {
                  if (group.name !== userData) {
                    block.insertAdjacentHTML("beforeend", `
                    <option value="${group.id}">${group.name}</option>
                  `)
                  }
                })
              })
          }
          drawData("groups/get-all", editGroup, userGroup)
          drawData("plots/get-all", editPlot, userPlot)

          const editForm = modal.querySelector('.edit__form')
          editForm.addEventListener('submit', e => {
            console.log(e.target)
            e.preventDefault()

            const formData = new FormData(editForm)

            if (formData.get("password") !== formData.get("password_repeat")) {
              if (!err) {
                ok = false
                err = true
                editForm.insertAdjacentHTML("beforeend", `
            <div class="edit-form__error">
                <h3>Пароли не совпадают</h3>
            </div>
        `)
              }

              return
            }

            const obj = {}
            formData.forEach(((value, key) => {
              switch (key) {
                case "id":
                  obj[key] = Number(value)
                  break
                case "password_repeat":
                  break
                case 'disable':
                  obj[key] = value === "on"
                  break
                default:
                  obj[key] = value
              }
            }))

            sendData(`${appAddr}/api/users/edit`, 'PUT', JSON.stringify(obj))
              .then(res => {
                if (res.ok) {
                  if (!ok) {
                    ok = true
                    editForm.insertAdjacentHTML('beforeend', `
                      <div class="edit-form__succ edit-form__succ--user">
                          <h3>Пользователь успешно изменён</h3>
                      </div>
                    `)
                  }

                  setTimeout(() => {
                    editForm.querySelector('.edit-form__succ').remove()
                    ok = false
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
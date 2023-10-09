import {sendData} from "../sendData";
import {appAddr} from "../../../../../../appAddr";
import {topFiltersHandler} from "../filters/topFilters";

export const drawAdminFilters = (modal, datas) => {
  let ok = false
  let err = false

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
                    <input style="cursor: text;" required id="name" class="route__input edit-form__input edit-form__name" name="name" type="text"
                           value="${d.name}">
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="login">Участки</label>
                      <select required class="route__select edit-form__input edit-form__plot" name="plot_id" id="plot">
                          <option value="${d.plot_id}">${d.plot}</option>
                      </select>
                  </div>
                  
                  <div class="edit-form__block edit-form__block--checker">
                      <label class="edit-form__label edit-form__label--checker" for="disable">Скрыть</label>
                      <input style="cursor: pointer" ${d.disable ? 'checked' : ''} id="disable" class="" name="disable" type="checkbox">
                  </div>        
                  
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Начало работы</label>
                    <input style="cursor: pointer" id="name" class="route__input edit-form__input edit-form__name" name="start_time" type="time"
                           value="${d.start_time}">
                  </div>
                  
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Конец работы</label>
                    <input style="cursor: pointer" id="name" class="route__input edit-form__input edit-form__name" name="end_time" type="time"
                           value="${d.end_time}">
                  </div>
      
                  <div class="edit-form__block">
                      <button class="section-finish__btn section-finish__sub edit-form__submit" type="submit">Сохранить</button>
                  </div>
              </div>
        </form>
        `)

          const editPlot = document.querySelector(".edit-form__plot")
          const filterPlot = document.querySelector(".edit-form__plot option").textContent
          const drawData = (url, block, userData) => {
            fetch(`${appAddr}/api/${url}`)
              .then(res => res.json())
              .then(data => {
                data.data.forEach(group => {
                  if (group.name !== userData && group.name !== 'все') {
                    block.insertAdjacentHTML("beforeend", `
                        <option value="${group.id}">${group.name}</option>
                    `)
                  }
                })
              })
          }
          drawData("plots/get-all", editPlot, filterPlot)

          const editForm = modal.querySelector('.edit__form')
          editForm.addEventListener("submit", e => {
            e.preventDefault()

            const formData = new FormData(editForm)

            const startTime = formData.get("start_time")
            const endTime = formData.get("end_time")

            if (startTime.length || endTime.length) {
              if (!validateTime(startTime, endTime)) {
                err = true

                editForm.insertAdjacentHTML("beforeend", `
                  <div class="user-form__block user-form__error">
                      <h3>Некорректный формат времени</h3>
                  </div>
                `)

                return
              }
            }

            const obj = {}
            formData.forEach(((value, key) => {
              switch (key) {
                case "id":
                  obj[key] = Number(value)
                  break
                case 'disable':
                  obj[key] = value === "on"
                  console.log(value === "on")
                  break
                default:
                  obj[key] = value.trim()
              }
            }))

            const subBtn = editForm.querySelector('.edit-form__submit')
            sendData(`${appAddr}/api/filters/edit`, 'PUT', JSON.stringify(obj))
              .then(res => {
                if (res.ok) {
                  editForm.reset()
                  if (!ok) {
                    ok = true
                    editForm.insertAdjacentHTML('beforeend', `
                      <div class="edit-form__succ edit-form__succ--filter">
                          <h3>Фильтр успешно изменён</h3>
                      </div>
                    `)
                    editForm.style.height = '480px'
                    subBtn.style.marginTop = '65px'
                  }

                  topFiltersHandler()
                  setTimeout(() => {
                    editForm.querySelector('.edit-form__succ').remove()
                    ok = false
                    editForm.style.height = '446px'
                    subBtn.style.marginTop = '20px'
                  }, 1000)
                }

                return res.json()
              }).then(data => {
              console.log(data)
            })
          })

          const validateTime = (startTime, endTime) => {
            const arrStartTime = startTime.split(":")
            const arrEndTime = endTime.split(":")

            if (arrStartTime.length !== 2 || arrEndTime.length !== 2) {
              return false
            }

            if (Number(arrStartTime[0]) > Number(arrEndTime[0])) {
              return false
            }

            for (let i = 0; i < arrStartTime.length; i++) {
              if (arrStartTime[i].length !== 2 || arrEndTime[i].length !== 2) {
                return false
              }
            }

            return true
          }
        })
    })
  })
}
import {sendData} from "../sendData";
import {appAddr} from "../state";

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

export const filterAdd = (modal) => {
  let ok = false
  let err = false

  const contentPlace = modal.querySelector('.nav-content')
  const navContent = modal.querySelector('.nav-content')
  try {
    contentPlace.querySelector('.nav-content__columns').remove()
    contentPlace.querySelector('.nav-content__items').remove()
    contentPlace.querySelector('.edit-form').remove()
  } catch {
  }

  navContent.insertAdjacentHTML('afterbegin', `
            <form class="edit__form edit__form--group edit-form edit-form--group" method="post" style="height: 400px">
              
              <div class="edit-form__user">
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Фильтр</label>
                    <input style="cursor: text;" required id="name" class="route__input edit-form__input edit-form__name" name="name" type="text">
                  </div>
  
                  <div class="edit-form__block">
                      <label class="edit-form__label" for="login">Участки</label>
                      <select required class="route__select edit-form__input edit-form__plot" name="plot_id" id="plot">
                      </select>
                  </div>
                  
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Начало работы</label>
                    <input style="cursor: pointer" id="name" class="route__input edit-form__input edit-form__name" name="start_time" type="time" value="08:00">
                  </div>
                  
                  <div class="edit-form__block">
                    <label class="edit-form__label" for="name">Конец работы</label>
                    <input style="cursor: pointer" id="name" class="route__input edit-form__input edit-form__name" name="end_time" type="time" value="20:00">
                  </div>
      
                  <div class="edit-form__block">
                      <button class="section-finish__btn section-finish__sub edit-form__submit" type="submit">Сохранить</button>
                  </div>
              </div>
        </form>
        `)

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
  drawData("plots/get-all", editPlot)

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
    sendData(`${appAddr}/api/filters/add`, 'POST', JSON.stringify(obj))
      .then(res => {
        if (res.ok) {
          editForm.reset()
          if (!ok) {
            ok = true
            editForm.insertAdjacentHTML('beforeend', `
              <div class="edit-form__succ edit-form__succ--filter">
                  <h3>Фильтр успешно добавлен</h3>
              </div>
            `)
            editForm.style.height = '434px'
            subBtn.style.marginTop = '65px'
          }

          setTimeout(() => {
            editForm.querySelector('.edit-form__succ').remove()
            ok = false
            editForm.style.height = '400px'
            subBtn.style.marginTop = '20px'
          }, 1000)
        }

        return res.json()
      }).then(data => {
      console.log(data)
    })
  })
}
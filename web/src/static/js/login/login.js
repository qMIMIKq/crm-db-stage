import "../../css/login/login.scss"
import {state} from "../modules/state";
import {appAddr} from "../../../../../appAddr";

//192.168.1.231
//172.20.10.7
//91.142.94.150
// export const appAddr = 'http://91.142.94.150:8182'
// const appAddr = 'http://192.168.1.231:8182'
// const appAddr = 'http://172.20.10.7:8182'
// const appAddr = 'http://192.168.0.104:8182'

console.log(JSON.parse(localStorage.getItem('user')))

const loginForm = document.querySelector(".login-form")
loginForm.addEventListener("submit", e => {
  e.preventDefault()
  const errBlock = document.querySelector(".user-form__error")
  const formData = new FormData(loginForm)
  const obj = {}
  formData.forEach((value, key) => {
    obj[key] = value.trim()
  })
  fetch(`${appAddr}/auth/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(obj)
  }).then(res => {
    if (res.ok) {
      res.json().then(userInfo => {
        const data = JSON.parse(JSON.stringify(userInfo))
        state["userInfo"] = {
          "name": data["data"].name,
          "nickname": data["data"].nickname,
          "group": data["data"].group,
          "plot": data["data"].plot,
          "groupId": data["data"].group_id
        }

        localStorage.setItem("user", JSON.stringify(state["userInfo"]))
        window.location.replace(`${appAddr}/main/table`)
      })

    } else if (errBlock === null) {
      loginForm.insertAdjacentHTML("beforeend", `
          <div class="user-form__block user-form__error">
              <h3>Неверное имя пользователя или пароль</h3>
          </div>
      `)
    }
  })
})
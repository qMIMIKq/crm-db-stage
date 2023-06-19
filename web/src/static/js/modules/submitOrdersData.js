import {finallyForOrders} from "./submitControl";
import {appAddr} from "./state";
import {sendData} from "./sendData";

const createRes = forms => {
    const res = []
    forms.forEach(form => {
        const formData = new FormData(form)
        const obj = {}

        obj["routes_json"] = {}
        formData.forEach((value, key) => {
            switch (key) {
                case "files":
                    obj[key] = value.split(", ")
                    break
                case "comments":
                    obj[key] = value.split(".-.")
                    break
                case "routes_json":
                    break
                default:
                    obj[key] = value.trim()
            }

            if (key.includes("route") && !key.includes("issued") && !key.includes("json") && value !== "") {
                if (value !== "-") {
                    obj["routes_json"][key] = JSON.parse(String(value))
                }
            }
        })
        res.push(obj)
        console.log(res)
    })
    return res
}

export function submitData() {
    const forms = document.querySelectorAll(".table-form--new")
    const formsUpd = document.querySelectorAll(".table-form--upd")
    let success = false
    const resNew = createRes(forms)
    const resUpd = createRes(formsUpd)
    if (resNew.length) {
        sendData(`${appAddr}/api/orders/add`, "POST", JSON.stringify(resNew)).then(res => {
            if (res.ok) success = true
        }).finally(() => {
            finallyForOrders(success)
        })
    }
    if (resUpd.length) {
        sendData(`${appAddr}/api/orders/update`, "PUT", JSON.stringify(resUpd)).then(res => {
            if (res.ok) success = true
        }).finally(() => {
            finallyForOrders(success)
        })
    }
}

import {sendData} from "./sendData";
import {appAddr} from "./appAddr";

export const sendReportData = data => {
  sendData(`${appAddr}/api/report/update`, 'POST', JSON.stringify(data))
    .then(resp => {
      return resp.json()
    })
    .then(res => {
      console.log(res)
    })
}


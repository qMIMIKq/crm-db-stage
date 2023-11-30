import {state} from "../../modules/state";
import {drawReport} from "../drawReport";

export const globalFilterReports = (report, i) => {
  let flag = true
  for (let type in state['tableFilters']) {
    const filter = state['tableFilters'][type]
    if (filter === 'все') {
    } else if (filter) {
      if (!(report[type].trim() === state['tableFilters'][type].trim())) {
        flag = false
        break
      }
    }
  }

  if (flag) {
    drawReport(report, i)
  }

  return flag
}
import {drawOrders, table} from "./drawOrders";
import {state} from "../state";
import {getTime} from "../getTime";
import {submitData} from "../submitOrdersData";
import {drawSubmit} from "../submitControl";
import {deleteOrdersHandler} from "../deleteOrdersHandler";
import {drawDeadlineP} from "./drawDeadlineP";
import {drawManagers} from "./drawManagers";
import {colorRoutes} from "./routesDraw";
import {cleanSelect} from "../getOrders";
import {bindOrdersListeners} from "../bindListeners";

export const drawUpdatedData = (d, data, filtered) => {
  let uniqueFileNames = []

  if (d.files !== null && d.files !== undefined) {
    d.files.forEach(file => {
      const arrDotFile = file.split('.')
      const fileType = arrDotFile[arrDotFile.length - 1]

      const arrSlashFile = file.split('/')
      arrSlashFile.splice(0, 3)
      const fileName = arrSlashFile.join('')
      let fileNameWithoutType = fileName.split('.')
      fileNameWithoutType = fileNameWithoutType.splice(0, fileNameWithoutType.length - 1).join('.')

      switch (fileType) {
        case 'png':
        case 'PNG':
          if (!uniqueFileNames.includes(fileNameWithoutType))
            uniqueFileNames.push(fileNameWithoutType)
          break
        default:
          uniqueFileNames.push(fileNameWithoutType)
      }
    })
  }

  const orderCompleted = d.quantity && d.issued && Number(d.issued) >= Number(d.quantity)

  let alertDeadline = false
  if (d.end_time) {
    let deadline = new Date(d.end_time.split('T')[0])
    let term = Number(d.p ? d.p.split('дн')[0] : 3)
    deadline.setDate(deadline.getDate() - term)

    let today = getTime()
    today = today.split(' ')[0]
    today = new Date(today)

    if (today.getTime() >= deadline.getTime()) {
      alertDeadline = true
    }
  }

  const currentOrder = document.querySelector(`#form-${d.id}`)
  const orders = state.orders

  if (currentOrder) {
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].id === d.id) {
        orders[i] = d
        break
      }
    }

    if (state.filtered) {
      return
    }

    currentOrder.querySelector('#number').value = d.number
    currentOrder.querySelector('input[name="client"]').value = d.client
    currentOrder.querySelector('input[name="files"]').value = `${d.files ? d.files.join(', ') : ''}`
    currentOrder.querySelector('#total_files').value = uniqueFileNames.length
    currentOrder.querySelector('input[name="name"]').value = d.name
    currentOrder.querySelector('input[name="material"]').value = d.material
    currentOrder.querySelector('input[name="quantity"]').value = d.quantity
    const issued = currentOrder.querySelector('input[name="issued"]')
    issued.value = d.issued
    if (orderCompleted && !state.isArchive) {
      issued.classList.add('table__issued--done')
    } else {
      issued.classList.remove('table__issued--done')
    }

    currentOrder.querySelector('select[name="m"]').value = d.m
    const endTime = currentOrder.querySelector('input[name="end_time"]')
    endTime.value = `${d.end_time ? d.end_time.split("T")[0].replaceAll('-', '.') : ''}`
    if (alertDeadline && !state.isArchive) {
      endTime.classList.add('table__endtime--dead')
    } else {
      endTime.classList.remove('table__endtime--dead')
    }

    currentOrder.querySelector('select[name="p"]').value = d.p
    currentOrder.querySelector('input[name="comment"]').value = `${d.comments ? d.comments[d.comments.length - 1] : ""}`
    const comments = currentOrder.querySelector('input[name="all_comments"]')
    comments.value = `${d.comments ? d.comments.join(".-.") : ""}`

    currentOrder.classList.remove('table-form--upd')
    currentOrder.classList.add('table-form--old')

    const routes = d["db_routes"]

    const completedBlock = currentOrder.querySelector('.table__issued--done')
    if (completedBlock && !state['isArchive']) {
      completedBlock.insertAdjacentHTML(`afterend`, `
      <li class="table-body_cell table-body__helper hidden__input table__complete">
          <input class="table__data table__issued--done main__button tr" tabindex="-1"
          readonly
          type="text"
          autocomplete="off"
          value="В архив">
      </li>
  `)
      currentOrder.querySelector('.table__complete').addEventListener('click', e => {
        currentOrder.querySelector('#completed').value = true
        const parent = e.target.closest('.table-form--old')
        let today = getTime()
        today = today.substring(0, today.length - 5).trim()

        if (parent !== null) {
          parent.classList.remove('table-form--old')
          parent.classList.add('table-form--upd')
          const endTimeIn = parent.querySelector('.table__endtime').querySelector('input')
          endTimeIn.value = today
          submitData()
        } else {
          drawSubmit()
        }
      })
    }

    if (state['openedOrders'].includes(String(d.id))) {
      currentOrder.querySelectorAll('.table__data').forEach(item => {
        if (!item.classList.contains('tr')) {
          if (!item.classList.contains('table__data--opened')) {
            item.classList.add('table__data--opened')
          }
        } else {
          item.classList.add('table__data--chosen')
        }
      })

      deleteOrdersHandler(currentOrder, d.issued, routes, d.id, false)

      try {
        currentOrder.querySelector('.table-routes__issued').classList.remove('hidden__input')
        const complete = currentOrder.querySelector('.table__complete')
        complete.classList.remove('hidden__input')
        complete.querySelector('.tr').classList.add('table-data__chosen')
      } catch {
      }
    }

    if (String(d.id) === state['currentOrder']) {
      currentOrder.querySelectorAll('.table__data').forEach(item => {
        if (!item.classList.contains('table__data--opened')) {
          item.classList.add('table__data--chosen')
        }
      })
    }

    // bindOrdersListeners(currentOrder)
    if (!state['isArchive']) {
      cleanSelect(currentOrder, ".table-p-select")
      cleanSelect(currentOrder, ".table-m-select")

      drawDeadlineP(currentOrder, ".table-p-select", state['deadlinesP'], d.p)
      drawManagers(currentOrder, ".table-m-select", state.managers, d.m)

      if (routes) {
        colorRoutes(routes, currentOrder)
      } else {
        deleteOrdersHandler(currentOrder, d.issued, false, d.id)
      }
    }
  } else {
    console.log('WTF')
    state.orders.push(d)

    if (state.filtered) {
      return
    }

    document.querySelectorAll('.table-form--new').forEach(newOrder => newOrder.remove())
    drawOrders(table, 'afterbegin', d, state.orders, state.managers)
  }
}
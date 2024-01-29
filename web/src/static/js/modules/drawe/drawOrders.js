import {controlFiltersReset} from '../filters/tableFilters';
import {drawDeadlineP} from './drawDeadlineP';
import {state} from '../state';
import {drawManagers} from './drawManagers';
import {drawSubmit} from "../submitControl";
import {deleteOrdersHandler} from "../deleteOrdersHandler";
import {colorRoutes} from "./routesDraw";
import {getTime} from "../getTime";
import {submitData} from "../submitOrdersData";
import {addTriggers} from "../addTriggers";
import {triggerFilesModal} from "../modals/downloadFilesModal";
import {triggerRoutesModal} from "../modals/routesModal";
import {triggerCommentsModal} from "../modals/commentsModal";
import {copyOrderHandler} from "../copyOrderHandler";
import {cleanSelect} from "../getOrders";
import {drawHelpers} from "./helpersDraw";
import {showRoutesIssued} from "../showFull";

export const table = document.querySelector('.main-table')

export const drawOrders = (insertPlace, position, d, data, users) => {
  // console.time(`draw order ${d.id}`)

  console.log('can remove ', d.can_remove)
  controlFiltersReset()
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

  insertPlace.insertAdjacentHTML(position, `
      <form id="form-${d.id}" class='table-form table-form--old showed-order' method='POST'>
        <ul class='main-table__item'>
            <input id="can-remove" type="text" name="can_remove" class="hidden__input table-form__can-remove can-remove" value="${d.can_remove}">
        
            <li class='table-body_cell table__db'>
                <input class="order__copy table__data--ro" id='order__copy' type="button" value="+" readonly>
                <input id='db_id' class='main__button table__data click-select table__data--ro' name='id' type='number' readonly value='${d.id}' tabindex='-1' autocomplete='off'>
            </li>
            <li class='table-body_cell table__timestamp'>
                <input id='timestamp' class='table__data   table__data--ro' name='timestamp' type='text' readonly value='${d.timestamp ? d.timestamp.split('T')[0].replaceAll('-', '.') : ''}' tabindex='-1' autocomplete='off'>
            </li>
             <li class='table-body_cell hidden-input'>
                <input id='files' class='table__data  table__data--ro hidden-input' name='files' type='text' value='${d.files ? d.files.join(', ') : ''}' tabindex='-1' autocomplete='off'>
            </li>
            <li class='table-body_cell table__files'>
                <input id="total_files" class='main__button table__data  click-chose table__data--ro' type='text' readonly value='${uniqueFileNames.length}' tabindex='-1' autocomplete='off'>
            </li>
            <li class='table-body_cell table-body__helper ${d.number ? "table-body__attr" : ""}  table__number'>
                <input 
                ${state['inputAdmManGroupper']}
                id='number' class='table__data ' name='number' type='text' value='${d.number}' tabindex='-1' autocomplete='off'>
            </li>
            <li class='table-body_cell table-body__helper table__sample'>
                <input class='table__data   table__data--ro' name='sample' type='text' value='' readonly tabindex='-1' autocomplete='off'>
            </li>
            <li  class='table-body_cell table-body__helper ${d.client ? "table-body__attr" : ""} table__client'>
                <input ${state['inputAdmManGroupper']} class='table__data ' type='text' name='client' value='${d.client}' tabindex='-1' autocomplete='off'>
            </li>
            <li  class='table-body_cell table-body__helper ${d.name ? "table-body__attr" : ""} table__name'>
                <input ${state['inputAdmManGroupper']} class='table__data ' type='text' name='name' value='${d.name}' tabindex='-1' autocomplete='off'>
            </li>
            <li  class='table-body_cell table-body__helper ${d.material ? "table-body__attr" : ""} table__material'>
                <input ${state['inputAdmManGroupper']} class='table__data ' type='text' name='material' value='${d.material}' tabindex='-1' autocomplete='off'>
            </li>
            <li class='table-body_cell table__quantity'>
                <input ${state['inputAdmManGroupper']} class='table__data ' type='number' name='quantity' required value='${d.quantity}' tabindex='-1' autocomplete='off'>
            </li>
            <ul class="table__issueds">
                <li class="table-body_cell table__issued">
                    <input ${state["inputAdmTechGroupper"]} class="table__data ${orderCompleted && !state["isArchive"] ? "table__issued--done tr" : ""}" tabindex="-1"
                    type="number" 
                    name="issued" 
                    required  autocomplete="off"
                    value="${d.issued}">
                </li>
            </ul>
            <li class="table-body_cell hidden__input table__finished">
                <input type="text" class="table__data hidden__input" value=${d.completed} id="completed" name="completed">
            </li>
            <li class="table-body_cell table-body__helper ${d.m ? "table-body__attr" : ""}  table__m">
                <select ${state['adminCheck'] || state['manCheck'] ? "" : 'style="pointer-events : none"'} class="table__data table-m-select main__button" name="m" id="">
                </select>
            </li>
            <li class="table-body_cell table__endtime">
                <input class="main__button table__data ${alertDeadline ? 'table__endtime--dead' : ''}"
                ${state["inputAdmManTechGroupper"]} 
                name="end_time" 
                type="text"
                placeholder=" " 
                value="${d.end_time ? d.end_time.split("T")[0] : ''}" 
                onfocus="this.type='date'"
                onblur="(this.type='text')"
                tabindex="-1" 
                autocomplete="off">
            </li>
            <li class="table__routes table-routes">
                <input readonly type="text" class="hidden__input" name="routes_json">
                <ul class="table-routes__wrapper">
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-1" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-2" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-3" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-4" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-5" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-6" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-7" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-8" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-9" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route">
                        <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                        <input readonly class="hidden__input table__data" name="route-10" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                </ul>
                <ul class="table-routes__wrapper hidden__input table-routes__issued">
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-1-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-2-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-3-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-4-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-5-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-6-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-7-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-8-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-9-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__route--issued">
                        <input readonly class="table__data table__data--ro tr click-chose" name="route-10-issued" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                </ul>
            </li>
            <li class="table-body_cell table-body__helper table__p">
                <select ${state['adminCheck'] || state['manCheck'] ? "" : 'style="pointer-events : none"'} class="main__button table__data table-p-select" name="p" tabindex="-1" autocomplete="off">
                    <option selected value=""></option>
                </select>
            </li>
            <li class="table-body_cell hidden-input">
                <input class="table__data hidden-input table__data--ro" 
                    name="comments" 
                    type="text"
                    value="" 
                    readonly 
                    autocomplete="off"
                    tabindex="-1">
            </li>
            <li class="table-body_cell hidden-input">
                <input class="table__data  hidden-input table__data--ro" §
                    name="all_comments" 
                    type="text"
                    value="${d.comments ? d.comments.join(".-.") : ""}" 
                    readonly 
                    autocomplete="off"
                    tabindex="-1">
            </li>
            
            <li class="table-body_cell table-body__helper ${d.comments ? "table-body__attr" : ""} table__comment">
                <input ${state["inputAdmManTechGroupper"]} class="main__button table__data click-chose table__data--ro" tabindex="-1"
                    name="comment" 
                    type="text" 
                    value="${d.comments ? d.comments[d.comments.length - 1] : ""}" 
                    autocomplete="off"
                    readonly>
            </li>
        </ul>
    </form>
  `)

  const currentOrder = document.getElementById(`form-${d.id}`)
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
        currentOrder.remove()
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

  if (!state['isArchive']) {
    cleanSelect(currentOrder, ".table-p-select")
    cleanSelect(currentOrder, ".table-m-select")

    drawDeadlineP(currentOrder, ".table-p-select", state['deadlinesP'], d.p)
    drawManagers(currentOrder, ".table-m-select", state.managers, d.m)
  }

  if (routes) {
    colorRoutes(routes, currentOrder)
    deleteOrdersHandler(currentOrder, d.issued, routes, d.id)
  } else {
    deleteOrdersHandler(currentOrder, d.issued, routes, d.id)
  }

  addTriggers(currentOrder, "#db_id", showRoutesIssued)
  addTriggers(currentOrder, '.table__files', triggerFilesModal)
  addTriggers(currentOrder, '.table__route', triggerRoutesModal)
  addTriggers(currentOrder, '.table__comment', triggerCommentsModal)
  addTriggers(currentOrder, ".order__copy", copyOrderHandler)
  drawHelpers(currentOrder)

  if (state.adminCheck || state.manCheck) {
    addTriggers(currentOrder, ".order__copy", copyOrderHandler)
  } else {
    document.querySelectorAll('#order__copy').forEach(copy => copy.remove())
  }

  // console.timeEnd(`draw order ${d.id}`)
}

export const orderHTML = `
<form class="table-form table-form--new" method="POST">
            <ul class="main-table__item">            
                    <li class="table-body_cell table-body__helper table__db">
                        <input id="can-remove" type="text" name="can_remove" class="hidden__input table-form__can-remove can-remove" value="yes">
                        <input class="order__copy table__data--ro" id='order__copy' type="button" value="+" readonly>
                        <input id="db_id" class="main__button table__data  click-select table__data--ro" name="id" type="number" readonly value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__timestamp">
                        <input id="timestamp" class="table__data   table__data--ro" name="timestamp" type="text" readonly value="" tabindex="-1" autocomplete="off">
                    </li>
                     <li class="table-body_cell table-body__helper hidden-input">
                        <input id="files" class="table__data  table__data--ro hidden-input" name="files" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__files">
                        <input id="total_files" class="main__button table__data  click-chose table__data--ro" type="text" readonly value="0" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__number">
                        <input id="number" class="table__data " name="number" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__sample">
                        <input class="table__data   table__data--ro" name="sample" type="text" value="" readonly tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__client">
                        <input class="table__data " type="text" name="client" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__name">
                        <input class="table__data " type="text" name="name" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__material">
                        <input class="table__data " type="text" name="material" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__quantity">
                        <input class="table__data " type="number" name="quantity" required value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table-body__helper table__issued">
                        <input class="table__data" tabindex="-1"
                        type="number" 
                        name="issued" 
                        required  autocomplete="off"
                        value="">
                    </li>
                    <li class="table-body_cell table-body__helper table__m">
                        <select class="table__data table-m-select main__button" name="m" id="">
                        </select>
                    </li>
                    <li class="table-body_cell table-body__helper table__endtime">
                        <input class="main__button table__data " 
                        name="end_time" 
                        type="text"
                        placeholder=" " 
                        value="" 
                        onfocus="this.type='date'"
                        onblur="(this.type='text')"
                        tabindex="-1" 
                        autocomplete="off">
                    </li>
                    <li class="table__routes table-routes">
                        <input readonly type="text" class="hidden__input" name="routes_json">
                        <ul class="table-routes__wrapper">
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-1" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-2" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-3" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-4" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-5" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-6" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-7" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-8" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-9" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-10" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                        </ul>
                        <ul class="table-routes__wrapper hidden__input table-routes__issued">
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-1-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-2-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-3-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-4-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-5-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-6-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-7-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-8-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-9-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table-body__helper table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-10--issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                        </ul>
                    </li>
                    <li class="table-body_cell table-body__helper table__p">
                        <select class="main__button table__data table-p-select" name="p" tabindex="-1" autocomplete="off">
                        </select>
                    </li>
                    <li class="table-body_cell table-body__helper hidden-input">
                        <input class="table__data hidden-input table__data--ro" 
                            name="comments" 
                            type="text"
                            value="" 
                            readonly 
                            autocomplete="off"
                            tabindex="-1">
                    </li>
                    <li class="table-body_cell table-body__helper hidden-input">
                        <input class="table__data  hidden-input table__data--ro" 
                            name="all_comments" 
                            type="text"
                            value="" 
                            readonly 
                            autocomplete="off"
                            tabindex="-1">
                    </li>
                    
                    <li class="table-body_cell table-body__helper table__comment">
                        <input class="main__button table__data click-chose table__data--ro" tabindex="-1"
                            name="comment" 
                            type="text" 
                            value="" 
                            autocomplete="off"
                            readonly>
                    </li>
                </ul>
        </form>
`

import {state} from '../modules/state';
import {controlReportsFiltersReset} from "./filters/reportFilters";
import {addTriggers} from "../modules/addTriggers";
import {triggerRoutesModal} from "../modules/modals/routesModal";

export const table = document.querySelector('.main-table')
export const shiftCounter = {}
export const drawReport = async (d) => {
  controlReportsFiltersReset()
  console.log(d)

  // console.log(d.shift, d.current_shift)
  // console.log(d)
  // if (d.prev_total) {
  //   console.log(d.order_id, d.report_date.split('T')[0].replaceAll("-", "."), d.prev_total)
  // }
  // console.log(d.order_id, d)

  // if (d.hidden_shift) {
  //   console.log(d.hidden_shift)
  // }

  let last = false
  if (d.current_shift) {
    if (Number(d.issued) >= Number(d.quantity)) {
      last = true
    }
  }

  let percents = 0

  let center = ''
  if (d.plan) {
    if (d.plan.includes('/')) {
      if (d.current_shift == 1) {
        center = d.plan.split('/')[0]
        if (center == 0) {
          percents = 100
        }

        // console.log(center)
      } else {
        center = d.plan.split('/')[1]
      }
    } else {
      center = d.plan
    }
  }

  // console.log(percents)

  if (d.current_shift) {
    if (d.current_shift && d.need_shifts && Number(d.current_shift) >= Number(d.need_shifts)) {
      center = d.quantity - d.prev_total
      percents = 0
      if (center < 0) center = 0
    }

  } else {
    if (d.hidden_shift && Number(d.hidden_shift) >= Number(d.need_shifts)) {
      center = d.quantity - d.prev_total
      if (center < 0) center = 0
    }
  }

  // if (d.need_shifts) {
  // d.current_shift ||

  // }

  //

  // console.log(d.current_shift, d.need_shifts)

  if (d.plan && d.issued_plan) {
    if (center != 0) {
      percents = (d.issued_plan / center) * 100
    }
  }

  percents = percents >= 0 ? percents : 0

  let timestamp
  if (d.timestamp) {
    if (d.timestamp.includes('T')) {
      timestamp = d.timestamp.split('T')[0].replaceAll("-", ".")
    } else {
      timestamp = d.timestamp.split(' ')[0].replaceAll("-", ".")
    }
  } else {
    timestamp = ''
  }

  let burning = false
  if (d.current_shift && d.need_shifts) {
    burning = Number(d.current_shift) > Number(d.need_shifts)
  }

  console.log(d.current_shift, d.need_shifts)

  if (d.current_shift > d.need_shifts) {
    percents = '-'
  } else {
    percents = percents.toFixed(0)
  }


  table.insertAdjacentHTML(`afterbegin`, `
    <form id="form-${d.report_id}" class='table-form table-form--old showed-order' method='POST'>
      <ul class='main-table__item'>
           <li class='table-body_cell hidden__input table__db'>
              <input tabindex="-1" id='route_id' class='table__data table__data--ro' name='id' type='number' readonly value='${d.route_id}' tabindex='-1' autocomplete='off'>
          </li>
      
          <li class='table-body_cell table__db'>
              <input tabindex="-1" id='db_id' class='table__data table__data--ro' name='id' type='number' readonly value='${d.order_id}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__timestamp'>
              <input tabindex="-1" class='table__data  ${d.not_planned ? 'table__endtime--dead' : ''}' name='id' type='text' readonly value='${d.report_date.split('T')[0].replaceAll("-", ".")}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__timestamp'>
              <input tabindex="-1" class='table__data table__data--ro' name='id' type='text' readonly value='${timestamp}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table-body__helper ${d.order_number ? "table-body__attr" : ""}  table__number'>
              <input tabindex="-1" 
              readonly
              id='number' class='table__data table__data--ro' name='number' type='text' value='${d.order_number}' tabindex='-1' autocomplete='off'>
          </li>
          <li  class='table-body_cell table-body__helper ${d.order_client ? "table-body__attr" : ""} table__client'>
              <input tabindex="-1" readonly class='table__data table__data--ro' type='text' name='client' value='${d.order_client}' tabindex='-1' autocomplete='off'>
          </li>
          <li  class='table-body_cell table-body__helper ${d.order_name ? "table-body__attr" : ""} table__name'>
              <input tabindex="-1" readonly class='table__data table__data--ro' type='text' name='name' value='${d.order_name}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__quantity'>
              <input tabindex="-1" readonly class='table__data table__data--ro' type='number' name='quantity' required value='${d.quantity}' autocomplete='off'>
          </li>
          <li class="table-body_cell table__issued--report">
              <input tabindex="-1" readonly class="table__data table__data--ro" tabindex="-1"
              type="number" 
              name="issued" 
              required  autocomplete="off"
              value="${d.prev_total}">
          </li>
          <li class="table-body_cell table__issued--report">
              <input tabindex="-1" readonly class="table__data table__data--ro ${last ? 'report-complete' : ''}" tabindex="-1"
              type="number" 
              name="issued" 
              required  autocomplete="off"
              value="${d.issued}">
          </li>
          <li class="table-body_cell table__route--report">
              <input tabindex="-1" readonly type="text" class="table__data order__plot-report" value="${d.order_plot}">
          </li>
           <li class="table-body_cell table__route--report">
              <input tabindex="-1" id="route_position" readonly type="text" class="table__data" value="${d.route_position}">
          </li>
          <li class="table-body_cell table__operator--report">
            <input tabindex="-1" readonly type="text" class="table__data" value="${d.operator}">
          </li>
          <li class='table-body_cell table-body__helper ${d.shift ? "table-body__attr" : ""} table__plan--shift'>
              <input tabindex="-1" readonly class='table__data table__data--ro ${burning ? 'bg-red' : ''} ${last ? 'report-complete' : ''}' type='text' name='shift' value='${d.current_shift || ""}' tabindex='-1' autocomplete='off'>
          </li>
          <li  class='table-body_cell table-body__helper ${d.need_shifts ? "table-body__attr" : ""} table__plan--need-shift'>
              <input tabindex="-1" readonly class='table__data table__data--ro' type='text' name='material' value='${d.need_shifts || ""}' tabindex='-1' autocomplete='off'>
          </li>
         
          <li class="table-body_cell table__use table__plan--theoradj">
             <input tabindex="-1" readonly class="table__data" tabindex="-1"
              type="number" 
              name="issued" 
              required  autocomplete="off"
              value="${d.theor_adjustment}">
          </li>
          
          <li class="table-body_cell table__use table__plan--adj">
             <input tabindex="-1" readonly class="table__data" tabindex="-1"
              type="number" 
              name="issued" 
              required  autocomplete="off"
              value="${d.adjustment && d.adjustment != '-1' ? d.adjustment : ''}">
          </li>
           <li class="table-body_cell table__use table__plan--report">
             <input tabindex="-1" readonly class="table__data" tabindex="-1"
              type="text" 
              name="issued" 
              required  autocomplete="off"
              value="${center}">
          </li>
          <li class="table-body_cell table__issued-plan--report">
            <input tabindex="-1" readonly type="number" class="table__data" value=${d.issued_plan && d.issued_plan != '-1' ? d.issued_plan : ''}>
          </li>
          <li class="table-body_cell table__plan--percent">
            <input tabindex="-1" readonly type="text" class="table__data" value=${percents}>
          </li>
        </ul>
    </form>
  `)

  const currentOrder = document.getElementById(`form-${d.report_id}`)

  if (String(d.id) === state['currentOrder']) {
    currentOrder.querySelectorAll('.table__data').forEach(item => {
      if (!item.classList.contains('table__data--opened')) {
        item.classList.add('table__data--chosen')
      }
    })
  }

  // addTriggers("#db_id", showRoutesIssued)
  // addTriggers(".table__files", triggerFilesModal)
  // addTriggers(".table__route", triggerRoutesModal)
  // addTriggers(".table__comment", triggerCommentsModal)
  addTriggers(currentOrder, '.order__plot-report', e => triggerRoutesModal(e, 'report'))

  try {
  } catch {
  }
}
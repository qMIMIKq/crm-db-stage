import {state} from '../modules/state';
import {controlReportsFiltersReset} from "./filters/reportFilters";

export const table = document.querySelector('.main-table')
export const shiftCounter = {}
export const drawReport = async (d, i) => {
  controlReportsFiltersReset()

  let last = d.shift && d.current_shift && d.shift === 'Последняя'
  console.log(d.shift)

  let percents = 0

  let center
  if (d.plan) {
    console.log(d.plan)

    if (d.plan.includes('/')) {
      center = d.plan.split('/')[1]
    } else {
      center = d.plan
    }
  }

  console.log(center)
  if (d.plan && d.issued_plan) {
    percents = (d.issued_plan / center) * 100
  }

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
    console.log(d.current_shift, d.need_shifts, burning)
  }


  table.insertAdjacentHTML(`afterbegin`, `
    <form id="form-${d.report_id}" class='table-form table-form--old showed-order' method='POST'>
      <ul class='main-table__item'>
          <li class='table-body_cell table__db'>
              <input id='db_id' class='table__data table__data--ro' name='id' type='number' readonly value='${d.order_id}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__timestamp'>
              <input class='table__data table__data--ro ${d.not_planned ? 'table__endtime--dead' : ''}' name='id' type='text' readonly value='${d.report_date.split('T')[0].replaceAll("-", ".")}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__timestamp'>
              <input class='table__data table__data--ro' name='id' type='text' readonly value='${timestamp}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table-body__helper ${d.order_number ? "table-body__attr" : ""}  table__number'>
              <input 
              readonly
              id='number' class='table__data table__data--ro' name='number' type='text' value='${d.order_number}' tabindex='-1' autocomplete='off'>
          </li>
          <li  class='table-body_cell table-body__helper ${d.order_client ? "table-body__attr" : ""} table__client'>
              <input readonly class='table__data table__data--ro' type='text' name='client' value='${d.order_client}' tabindex='-1' autocomplete='off'>
          </li>
          <li  class='table-body_cell table-body__helper ${d.order_name ? "table-body__attr" : ""} table__name'>
              <input readonly class='table__data table__data--ro' type='text' name='name' value='${d.order_name}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__quantity'>
              <input readonly class='table__data table__data--ro' type='number' name='quantity' required value='${d.quantity}' autocomplete='off'>
          </li>
          <li class="table-body_cell table__issued--report">
              <input readonly class="table__data table__data--ro" tabindex="-1"
              type="number" 
              name="issued" 
              required  autocomplete="off"
              value="${d.issued}">
          </li>
          <li class="table-body_cell table__route--report">
              <input readonly type="text" class="table__data" value="${d.order_plot}">
          </li>
           <li class="table-body_cell table__route--report">
              <input readonly type="text" class="table__data" value="${d.route_position}">
          </li>
          <li class="table-body_cell table__operator--report">
            <input readonly type="text" class="table__data" value="${d.operator}">
          </li>
          <li class='table-body_cell table-body__helper ${d.shift ? "table-body__attr" : ""} table__plan--report'>
              <input readonly class='table__data table__data--ro ${burning ? 'bg-red' : ''} ${last ? 'report-complete' : ''}' type='text' name='shift' value='${d.current_shift || ""}' tabindex='-1' autocomplete='off'>
          </li>
          <li  class='table-body_cell table-body__helper ${d.need_shifts ? "table-body__attr" : ""} table__plan--report'>
              <input readonly class='table__data table__data--ro' type='text' name='material' value='${d.need_shifts || ""}' tabindex='-1' autocomplete='off'>
          </li>
          <li class="table-body_cell table__use table__plan--report">
             <input readonly class="table__data" tabindex="-1"
              type="number" 
              name="issued" 
              required  autocomplete="off"
              value="${d.adjustment && d.adjustment != '-1' ? d.adjustment : ''}">
          </li>
           <li class="table-body_cell table__use table__plan--report">
             <input readonly class="table__data" tabindex="-1"
              type="text" 
              name="issued" 
              required  autocomplete="off"
              value="${center}">
          </li>
          <li class="table-body_cell table__issued-plan--report">
            <input readonly type="number" class="table__data" value=${d.issued_plan && d.issued_plan != '-1' ? d.issued_plan : ''}>
          </li>
          <li class="table-body_cell table__issued-plan--report">
            <input readonly type="number" class="table__data" value=${percents.toFixed(0)}>
          </li>
        </ul>
    </form>
  `)

  const currentOrder = document.getElementById(`form-${d.id}`)

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
}
export const table = document.querySelector('.main-table')
export const drawTimeReports = (d) => {

  table.insertAdjacentHTML(`afterbegin`, `
    <form id="form-${d.id}" class='table-form table-form--old showed-order' method='POST'>
      <ul class='main-table__item'>
          <li class='table-body_cell table__db'>
              <input id='db_id' class='table__data table__data--ro' name='id' type='text' readonly value='${d.route_plot}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__timestamp table__timestamp--time'>
              <input class='table__data' name='id' type='text' readonly value='${d.last_end}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__timestamp table__timestamp--time'>
              <input class='table__data' name='id' type='text' readonly value='${d.last_start}' tabindex='-1' autocomplete='off'>
          </li>
          <li class='table-body_cell table__timestamp table__timestamp--time'>
              <input class='table__data' name='id' type='text' readonly value='${d.current_expectation}' tabindex='-1' autocomplete='off'>
          </li>
         <li class='table-body_cell table__timestamp table__timestamp--time'>
              <input class='table__data' name='id' type='text' readonly value='${d.total_expectation}' tabindex='-1' autocomplete='off'>
          </li>
        </ul>
    </form>
  `)
}
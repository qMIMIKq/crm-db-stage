const enterHelper = e => {
  const elem = e.target
  const table = document.querySelector('.main-table')
  const distance = Math.abs(elem.offsetTop - table.offsetTop - table.offsetHeight)
  const valElem = e.target.querySelector('.table__data')
  const value = valElem.value

  if (value && (valElem.classList.contains('table-m-select') || valElem.scrollWidth > valElem.offsetWidth)) {
    elem.insertAdjacentHTML('beforeend', `
        <div class="check-helper">${value}</div>
    `)

    const helper = elem.querySelector('.check-helper')
    if (helper) {
      const helperHeight = helper.clientHeight
      let symbol = distance < 270 ? '' : '-'

      if (helperHeight > 23) {
        helper.style.bottom = `${symbol}${String(helperHeight - 23 + 35)}px`
      } else {
        helper.style.bottom = `${symbol}35px`
      }
    }
  }
}

const leaveHelper = e => {
  try {
    e.target.querySelector('.check-helper').remove()
  } catch {
  }
}

const enterHelperRoute = e => {
  const elem = e.target
  const parentForDist = elem.parentNode
  let value = e.target.getAttribute('data-title')
  const table = document.querySelector('.main-table')
  const distance = Math.abs(parentForDist.offsetTop - table.offsetTop - table.offsetHeight)

  if (value) {
    const check = value.split('/-_/')
    elem.insertAdjacentHTML('beforeend', `
      <div class="check-helper check-helper--long">
      </div>
    `)

    if (check[0]) {
      elem.querySelector('.check-helper').insertAdjacentHTML('beforeend', `
        <div>${check[0]}</div>
      `)
    }

    if (check[1]) {
      elem.querySelector('.check-helper').insertAdjacentHTML('beforeend', `
          <div style="color: red;" >${check[1].split('--').join(' ')}</div>
      `)
    }

    const helper = elem.querySelector('.check-helper')
    if (helper) {
      const helperHeight = helper.clientHeight
      let symbol = distance < 270 ? '' : '-'

      if (helperHeight > 23) {
        helper.style.bottom = `${symbol}${String(helperHeight - 23 + 35)}px`
      } else {
        helper.style.bottom = `${symbol}35px`
      }
    }
  }
}

export const drawHelpers = (currentOrder) => {
  currentOrder.querySelectorAll('.table-body__helper').forEach(cell => {
    if (!cell.classList.contains('table__route')) {
      cell.removeEventListener('mouseenter', enterHelper)
      cell.addEventListener('mouseenter', enterHelper)
    } else {
      cell.removeEventListener('mouseenter', enterHelperRoute)
      cell.addEventListener('mouseenter', enterHelperRoute)
    }

    cell.removeEventListener('mouseleave', leaveHelper)
    cell.addEventListener('mouseleave', leaveHelper)
  })
}
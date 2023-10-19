export const drawHelpers = (currentOrder) => {
  currentOrder.querySelectorAll('.table-body__helper').forEach(cell => {
    if (!cell.classList.contains('table__route')) {
      const valElem = cell.querySelector('.table__data')
      const value = valElem.value

      if ((valElem.classList.contains('table-m-select') && value.length > 2) || (valElem.scrollWidth > valElem.offsetWidth)) {
        const helperEnter = e => {
          if (value) {
            cell.insertAdjacentHTML('beforeend', `
                <div class="check-helper">${value}</div>
            `)

            const helper = cell.querySelector('.check-helper')
            if (helper) {
              const helperHeight = helper.clientHeight
              if (helperHeight > 23) {
                helper.style.bottom = '-' + String(helperHeight - 23 + 35) + 'px'
              } else {
                helper.style.bottom = '-35px'
              }
            }
          }
        }
        const helperLeave = e => {
          try {
            cell.querySelector('.check-helper').remove()
          } catch {
          }
        }

        cell.removeEventListener('mouseenter', helperEnter)
        cell.addEventListener('mouseenter', helperEnter)

        cell.removeEventListener('mouseleave', helperLeave)
        cell.addEventListener('mouseleave', helperLeave)
      }
    } else {
      let value = cell.getAttribute('data-title')
      const helperEnter = e => {
        if (value) {

          const check = value.split('/')
          cell.insertAdjacentHTML('beforeend', `
            <div class="check-helper check-helper--long">
            </div>
          `)

          if (check[0]) {
            cell.querySelector('.check-helper').insertAdjacentHTML('beforeend', `
                <div>${check[0]}</div>
            `)
          }

          if (check[1]) {
            cell.querySelector('.check-helper').insertAdjacentHTML('beforeend', `
                <div style="color: red;" >${check[1].split('--').join(' ')}</div> 
            `)
          }

          const helper = cell.querySelector('.check-helper')
          if (helper) {
            const helperHeight = helper.clientHeight
            if (helperHeight > 23) {
              helper.style.bottom = '-' + String(helperHeight - 23 + 35) + 'px'
            } else {
              helper.style.bottom = '-35px'
            }
          }
        }
      }
      const helperLeave = e => {
        try {
          cell.querySelector('.check-helper').remove()
        } catch {
        }
      }
      cell.removeEventListener('mouseenter', helperEnter)
      cell.addEventListener('mouseenter', () => helperEnter)

      cell.removeEventListener('mouseleave', helperLeave)
      cell.addEventListener('mouseleave', e => helperLeave)
    }
  })
}
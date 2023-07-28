export const drawHelpers = (currentOrder) => {
  currentOrder.querySelectorAll('.table-body__helper').forEach(cell => {
    if (!cell.classList.contains('table__route')) {
      const valElem = cell.querySelector('.table__data')
      const value = valElem.value

      if ((valElem.classList.contains('table-m-select') && value.length > 2) || (valElem.scrollWidth > valElem.offsetWidth)) {
        cell.addEventListener('mouseenter', () => {
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
        })

        cell.addEventListener('mouseleave', e => {
          try {
            cell.querySelector('.check-helper').remove()
          } catch {
          }
        })
      }
    } else {
      const value = cell.getAttribute('data-title')
      cell.addEventListener('mouseenter', () => {
        if (value) {
          cell.insertAdjacentHTML('beforeend', `
                <div class="check-helper check-helper--long">${value}</div>
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
      })

      cell.addEventListener('mouseleave', e => {
        try {
          cell.querySelector('.check-helper').remove()
        } catch {
        }
      })
    }
  })
}
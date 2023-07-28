import {showModal} from "./showModal";
import {getTime} from "../getTime";

const planDateModal = `
    <div id='modal' style='z-index: 10000' class='modal modal-plan__date bounceIn'>
      <div class='modal_content modal-plan modal_content--confirm' style='width: 400px'>
        <h2 class='confirm__title confirm__title--plan'>Назначить этап в план</h2>
        <div class="modal-plan__section">
            <div class="modal-plan__data">
                <label class="modal-plan__label">В план</label>
                <input type="date" class="main__button modal-plan__end">
            </div>
            <div class="modal-plan__check">
                <label>Срочно</label>
                <input type="checkbox" class="modal-plan__urgently"> 
            </div>
        </div>
        
        <h2 class="confirm__title confirm__title--plan">Удалить этап из плана</h2>
        <div class="modal-plan__section">
            <ul class="modal-plan__exclude">
            </ul>
            <input type="date" class="main__button modal-plan__exclude-chose">
        </div>
        
        <div class='confirm__section'>
            <button class='main__button confirm__button confirm__button--ok'>ОК</button>
            <button class='main__button confirm__button confirm__button--cncl'>Отмена</button>
        </div>
      </div>
   </div>
`

export const planDateHandler = (e, planObj, dateEndInput) => {
  const modal = showModal(planDateModal)
  const dateInput = modal.querySelector('.modal-plan__end')
  const dateUrgently = modal.querySelector('.modal-plan__urgently')
  const excludeSelect = modal.querySelector('.modal-plan__exclude')
  const excludeDateChose = modal.querySelector('.modal-plan__exclude-chose')

  let today = getTime()
  today = today.substring(0, today.length - 6)
  let tmrw = new Date(today)
  tmrw.setDate(tmrw.getDate() + 1)
  tmrw = tmrw.toLocaleString().split(", ")[0].split('/')
  ;[tmrw[0], tmrw[2]] = [tmrw[2], tmrw[0]]
  tmrw = tmrw.join('-')

  dateInput.setAttribute('min', tmrw)
  const getDays = (start, end) => {
    const oneDay = 1000 * 60 * 60 * 24
    let diff = end.getTime() - start.getTime()

    return Math.round(diff / oneDay)
  }

  let exclude = []
  if (planObj.planEnd) {
    dateInput.value = planObj.planEnd
    exclude = planObj.exclude ? planObj.exclude.split('__') : []
    const endDate = new Date(dateInput.value)
    const startDate = new Date(planObj.planStart)

    excludeDateChose.setAttribute('min', today)
    if (planObj.faster) {
      dateUrgently.setAttribute('checked', '')
    }

    if (startDate.getTime() < new Date(today).getTime()) {
      dateUrgently.setAttribute('disabled', '')
    }

    drawData(startDate, endDate)
    excludeSelect.insertAdjacentHTML('afterbegin', `
        <li class="modal-plan__exclude-option ${exclude.includes(planObj.planStart) ? 'exclude-date' : 'include-date'}">${planObj.planStart}</li>  
    `)
    addHandler()
  } else {
    dateInput.setAttribute('min', tmrw)
  }

  function addHandler() {
    modal.querySelectorAll('.modal-plan__exclude-option').forEach(option => {
      option.addEventListener('click', () => {
        option.classList.toggle('exclude-date')
        option.classList.toggle('include-date')

        if (option.classList.contains('exclude-date')) {
          exclude.push(option.textContent)
        } else {
          exclude = exclude.filter(ex => ex !== option.textContent)
        }
      })
    })
  }

  function drawData(startDate, endDate) {
    let res = getDays(startDate, endDate)
    for (let i = res + 1; i > 2; i--) {
      endDate.setDate(endDate.getDate() - 1)
      let date = endDate.toISOString().split('T')[0]

      excludeSelect.insertAdjacentHTML('afterbegin', `
        <li class="modal-plan__exclude-option ${exclude.includes(date) ? 'exclude-date' : 'include-date'}">${date}</li>  
      `)
    }

    excludeDateChose.setAttribute('max', dateInput.value)
    excludeSelect.insertAdjacentHTML('beforeend', `
        <li class="modal-plan__exclude-option ${exclude.includes(dateInput.value) ? 'exclude-date' : 'include-date'}">${dateInput.value}</li>  
    `)
  }

  if (dateInput.value) {
    excludeDateChose.removeAttribute('disabled')
  } else {
    excludeDateChose.setAttribute('disabled', '')
  }

  dateInput.addEventListener('change', e => {
    excludeDateChose.removeAttribute('disabled')
    const endDate = new Date(dateInput.value)
    const startDate = new Date(today)

    excludeSelect.querySelectorAll('li').forEach(date => {
      date.remove()
    })

    drawData(startDate, endDate)

    if (dateUrgently.checked) {
      excludeSelect.insertAdjacentHTML('afterbegin', `
        <li class="modal-plan__exclude-option ${exclude.includes(today) ? 'exclude-date' : 'include-date'}">${today}</li>  
      `)
      excludeDateChose.setAttribute('min', today)
    } else {
      excludeDateChose.setAttribute('min', excludeSelect.querySelector('li').textContent)
    }

    addHandler()
  })

  dateUrgently.addEventListener('change', e => {
    if (dateUrgently.checked) {
      excludeSelect.insertAdjacentHTML('afterbegin', `
        <li class="modal-plan__exclude-option include-date">${today}</li>  
      `)

      excludeSelect.querySelector('li').addEventListener('click', e => {
        e.target.classList.toggle('exclude-date')
        e.target.classList.toggle('include-date')

        if (e.target.classList.contains('exclude-date')) {
          exclude.push(e.target.textContent)
        } else {
          exclude = exclude.filter(ex => ex !== e.target.textContent)
        }
      })

      excludeDateChose.setAttribute('min', today)
    } else {
      excludeSelect.querySelector('li').remove()
      excludeDateChose.setAttribute('min', excludeSelect.querySelector('li').textContent)
    }
  })

  excludeDateChose.addEventListener('change', () => {
    excludeSelect.querySelectorAll('li').forEach(date => {
      if (date.textContent === excludeDateChose.value) {
        date.classList.add('exclude-date')
      }
    })

    excludeDateChose.value = ''
  })

  const okBtn = modal.querySelector('.confirm__button--ok')
  const cnclBtn = modal.querySelector('.confirm__button--cncl')

  okBtn.addEventListener('click', () => {
    planObj.exclude = exclude.join('__')
    planObj.planStart = excludeSelect.querySelector('li').textContent
    planObj.planEnd = dateInput.value
    planObj.faster = dateUrgently.checked

    dateEndInput.value = planObj.planEnd
    modal.click()
  })

  cnclBtn.addEventListener('click', () => modal.click())
}
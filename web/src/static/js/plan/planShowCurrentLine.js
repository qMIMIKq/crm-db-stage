export const planShowCurrentLine = () => {
  const mainTable = document.querySelector('.main__table')
  const forms = mainTable.querySelectorAll('form')

  forms.forEach(form => {
    form.addEventListener('click', e => {
      forms.forEach(outterForm => {
        outterForm.classList.remove('table__data--chosen')
        outterForm.querySelector('.table__route--date__list').classList.remove('table__data--chosen')
        try {
          outterForm.querySelector('.table__data--current').classList.remove('table__data--current')
        } catch {
        }
      })

      const target = e.target
      target.classList.add('table__data--current')
      form.classList.add('table__data--chosen')
      form.querySelector('.table__route--date__list').classList.add('table__data--chosen')
    })
  })
}
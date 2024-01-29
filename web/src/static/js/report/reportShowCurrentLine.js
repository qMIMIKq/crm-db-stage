export const reportShowCurrentLine = () => {
  const mainTable = document.querySelector('.main__table')
  const forms = mainTable.querySelectorAll('form')

  forms.forEach(form => {
    form.addEventListener('click', e => {
      forms.forEach(outterForm => {
        // outterForm.querySelector('.main-table__item').classList.remove('table__data--chosen')
        //

        try {
          outterForm.querySelector('.table__data--current').classList.remove('table__data--current')
          outterForm.querySelectorAll('.table__data--chosen').forEach(old => old.classList.remove('table__data--chosen'))
        } catch {
        }
      })

      const target = e.target
      target.classList.add('table__data--current')

      form.querySelectorAll('.table__data').forEach(old => old.classList.add('table__data--chosen'))
      // form.querySelector('.main-table__item').classList.add('table__data--chosen')
    })
  })
}
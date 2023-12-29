export const planShowCurrentLine = () => {
  const mainTable = document.querySelector('.main__table')
  const forms = mainTable.querySelectorAll('form')

  forms.forEach(form => {
    form.querySelector('#db_id').addEventListener('click', () => {
      form.querySelectorAll('.table__data').forEach(data => {
        data.classList.toggle('table__data--chosen')
      })
      form.querySelector('.table__route--date__list').classList.toggle('table__data--chosen')
    })

    form.querySelector('.shift__forw').addEventListener('click', () => {
      form.querySelectorAll('.table__data').forEach(data => {
        data.classList.toggle('table__data--chosen')
      })
      form.querySelector('.table__route--date__list').classList.toggle('table__data--chosen')
    })
  })
}
export const reportShowCurrentLine = () => {
  const mainTable = document.querySelector('.main__table')
  const forms = mainTable.querySelectorAll('form')

  forms.forEach(form => {
    try {
      form.querySelector('#db_id').addEventListener('click', () => {
        form.querySelectorAll('.table__data').forEach(data => {
          data.classList.toggle('table__data--chosen')
        })
      })
    } catch {}
  })
}
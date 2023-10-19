export const drawDeadlineP = (currentOrder, target, deadlines, chosenDeadline) => {
  const block = currentOrder.querySelector(target)

  block.insertAdjacentHTML('afterbegin', `
    <option selected value=''></option>
  `)

  deadlines.forEach(deadline => {
    block.insertAdjacentHTML('beforeend', `
         <option ${Number(chosenDeadline) === Number(deadline) ? 'selected' : ''} value='${deadline}'>${deadline}дн</option>
    `)
  })
}
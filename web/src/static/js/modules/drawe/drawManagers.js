export const drawManagers = (currentOrder, target, managers, manager) => {
  const block = currentOrder.querySelector(target)

  block.insertAdjacentHTML('afterbegin', `
    <option selected value=''></option>
  `)

  managers.forEach(man => {
    block.insertAdjacentHTML('beforeend', `
       <option ${manager === man ? 'selected' : ''} value='${man}'>${man}</option>
    `)
  })
}
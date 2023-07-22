export const drawManagers = (target, managers, manager) => {
  const block = document.querySelector(target)

  managers.forEach(man => {
    block.insertAdjacentHTML('beforeend', `
             <option ${manager === man.nickname ? 'selected' : ''} value='${man.nickname}'>${man.nickname}</option>
        `)
  })
}
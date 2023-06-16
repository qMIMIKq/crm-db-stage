export const drawManagers = (target, managers, manager) => {
    const block = document.querySelector(target)

    managers.forEach(man => {
        block.insertAdjacentHTML('beforeend', `
             <option ${manager === man ? "selected" : ""} value="${man}">${man}</option>
        `)
    })
}
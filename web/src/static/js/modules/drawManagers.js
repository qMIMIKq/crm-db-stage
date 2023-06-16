export const drawManagers = (target, managers, manager) => {
    const block = document.querySelector(target)

    managers.forEach(man => {
        let name = man.name.split(" ")
        name = name[0][0] + name[1][0]

        block.insertAdjacentHTML('beforeend', `
             <option ${manager === man.name ? "selected" : ""} value="${man.name}">${name}</option>
        `)
    })
}
export const drawDeadlineP = (target, deadlines, chosenDeadline) => {
    const block = document.querySelector(target)

    deadlines.forEach(deadline => {
        block.insertAdjacentHTML('beforeend', `
             <option ${Number(chosenDeadline) === Number(deadline) ? 'selected' : ''} value='${deadline}'>${deadline}дн</option>
        `)
    })
}
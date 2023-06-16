export const drawDeadlineP = (target, chosenDeadline, deadlines) => {
    const block = document.querySelector(target)

    deadlines.forEach(deadline => {
        block.insertAdjacentHTML('beforeend', `
             <option ${Number(chosenDeadline) === Number(deadline) ? "selected" : ""} value="${deadline}">${deadline}дн</option>
        `)
    })
}
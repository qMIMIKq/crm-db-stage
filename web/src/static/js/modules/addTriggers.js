export const addTriggers = (tag, trigger) => {
    const elems = document.querySelectorAll(tag)
    elems.forEach(elem => {
        elem.addEventListener("click", trigger)
    })
}

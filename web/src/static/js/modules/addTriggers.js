export const addTriggers = (elem, tag, trigger) => {
  const elems = elem.querySelectorAll(tag)
  elems.forEach(elem => {
    elem.addEventListener('click', trigger)
  })
}

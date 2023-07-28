export const getTime = () => {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  let hh = today.getHours()
  let mmm = today.getMinutes()
  mmm = String(mmm.length).length === 1 ? '0' + mmm : mmm

  today = `${yyyy}-${mm}-${dd} ${hh}:${mmm}`
  return today
}
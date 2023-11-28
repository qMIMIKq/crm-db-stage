export const getTime = () => {
  let today = new Date().toLocaleDateString('ru-RU', {timeZone: 'Europe/Moscow'})
  let todayTime = new Date().toLocaleTimeString('ru-RU', {timeZone: 'Europe/Moscow'})

  return `${today.split('.').reverse().join('-')} ${todayTime.substring(0, 5)}`
}
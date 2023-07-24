export const getTime = () => {
  let check = new Date().toLocaleString()
  check = check.split('/')
  check[2] = check[2].split(',')
  ;[check[0], check[2][0]] = [check[2][0], check[0]]
  check[2] = check[2].join(',')
  check = check.join('/')

  return check.replaceAll('/', '-').slice(0, check.length - 3).split(',').join(' ').replace(' ', '')
}
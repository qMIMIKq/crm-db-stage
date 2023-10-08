import {appAddr} from "./appAddr";

export const getData = async url => {
  const resp = await fetch(`${appAddr}/api/${url}`)
  if (!resp.ok) {
    console.log('beda')
  }
  return await resp.json()
}
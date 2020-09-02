import { PromiseEach } from './promise-each'

export const PromiseMap = async function (arr, fn) {
  const newArr = []
  let index = 0
  await PromiseEach(arr, async (item) => {
    newArr.push(await fn(item, index++))
  })
  return newArr
}

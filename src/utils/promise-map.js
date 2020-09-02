import { PromiseEach } from './promise-each'

/**
 * Loops through given `arr` of functions, awaiting for each result.
 *
 * @param {Function[]} arr
 * @param {Function} fn - callback function to pass iterated items
 * @param {Boolean} [breakOnFalse=false] - whether to stop the loop when false (explicitly) returned
 * @return {Promise<Array>} - array of results
 */

export const PromiseMap = async function (arr, fn, breakOnFalse) {
  const newArr = []
  let index = 0
  await PromiseEach(arr, async (item) => {
    newArr.push(await fn(item, index++))
  }, breakOnFalse)
  return newArr
}

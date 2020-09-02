/**
 * Loops through given `arr` of functions, awaiting for each result, alternatively breaking the loop when `breakOnFalse`
 * equals `true` and one of the functions returns `false` explicitly.
 *
 * @param {Function[]} arr
 * @param {Function} fn - callback function to pass iterated items
 * @param {Boolean} [breakOnFalse=false] - whether to stop the loop when false (explicitly) returned
 * @return {Promise<void>}
 */

export const PromiseEach = async function (arr, fn, breakOnFalse = false) {
  for (const item of arr) {
    if (await fn(item) === false && breakOnFalse) {
      break
    }
  }
}

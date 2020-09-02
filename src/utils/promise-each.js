export const PromiseEach = async function (arr, fn) {
  for (const item of arr) await fn(item)
}

/**
 * @method Utils~forEach
 * Loops into given array alternatively breaking the look when the callback returns `false` (explicitly).
 * @param {Array} arr
 * @param {Function} cb - Callback function called per item in the array passing the item and index as arguments.
 */
export function forEach(arr, cb) {
  for (let i = 0; i < arr.length; i++) {
    if (cb(arr[i], i) === false) {
      break
    }
  }
}

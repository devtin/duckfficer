/**
 * @method Utils~castArray
 * @desc Makes sure a value is wrapped in an array
 * @param {*} value - The value to wrap in an array. If the value is already an array, it is returned as is.
 * @return {Array}
 */
export function castArray (value) {
  return Array.isArray(value) ? value : [value]
}

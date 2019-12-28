/**
 * @method Utils~find
 * @desc Deeply finds given dot-notation path of an objects
 * @param {Object} obj
 * @param {String} path - Dot-notation address of the desired property
 * @return {*} Found value
 *
 * @example
 *
 * ```js
 * const obj = {
 *   prop1: {
 *     prop2: {
 *       prop3: 'Martin
 *     },
 *     firstName: 'Sandy'
 *   }
 * }
 *
 * console.log(find(obj, 'prop1.prop2.prop3') // => Martin
 * console.log(find(obj, 'prop1.prop2.firstName') // => Sandy
 * ```
 */
export function find (obj, path) {
  const [prop, paths] = path.split(/\./)
  if (paths && typeof obj[prop] === 'object') {
    return find(obj[prop], paths)
  }
  return obj[prop]
}

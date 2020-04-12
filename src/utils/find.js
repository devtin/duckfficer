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
 *       prop3: 'Martin'
 *     },
 *     firstName: 'Sandy'
 *   }
 * }
 *
 * console.log(find(obj, 'prop1.prop2.prop3') // => Martin
 * console.log(find(obj, 'prop1 .firstName') // => Sandy
 * ```
 */
export function find (obj, path) {
  const [prop, ...paths] = Array.isArray(path) ? path : path.split('.')
  if (paths.length > 0 && typeof obj[prop] === 'object') {
    return find(obj[prop], paths)
  }
  return prop ? obj[prop] : obj
}

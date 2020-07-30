/**
 * @class Utils
 * @classdesc Set of utilities
 */

/**
 * @method Utils~obj2dot
 * @desc Converts given object's own properties tree in a dot notation array
 * @param {Object} obj
 * @param {String} [parent]
 * @param {String} [separator=.]
 * @return {String[]}
 *
 * @example
 *
 * ```js
 * Utils.obj2dot({
 *   name: 'Martin',
 *   address: {
 *     city: 'Miami',
 *     zip: 305,
 *     line1: 'Brickell ave'
 *   }
 * }) // => ['name', 'address.city', 'address.zip', 'address.line1']
 * ```
 */
export function obj2dot (obj, { parent = '', separator = '.' } = {}) {
  const paths = []
  Object.keys(obj).forEach(prop => {
    if (obj[prop] && typeof obj[prop] === 'object' && !Array.isArray(obj[prop])) {
      return paths.push(...obj2dot(obj[prop], { parent: `${parent}${prop}${separator}`, separator }))
    }
    paths.push(`${parent}${prop}`)
  })
  return paths
}

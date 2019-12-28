/**
 * Makes sure a value is wrapped in an array
 * @param v
 * @return {Array}
 */
export function castArray (v) {
  return Array.isArray(v) ? v : [v]
}

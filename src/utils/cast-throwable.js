/**
 * @typedef {Array} ValueError
 * @desc Used as value in certain settings to alternatively customize error messages
 * @property {*} 0 - The value
 * @property {String} 1 - Alternative error message
 *
 * @example
 *
 * ```js
 * const ValueError = [3, `username's must have at least three characters`]
 * const mySchema = new Schema({
 *   username: {
 *     type: String,
 *     minlength: ValueError
 *   }
 * })
 * ```
 */

/**
 * @method Utils~castThrowable
 * @param {(*|ValueError)} value - The value
 * @param {String} error - Default error message
 * @return {ValueError}
 */
export function castThrowable (value, error) {
  if (Array.isArray(value) && value.length === 2) {
    return value
  }

  return [value, error]
}

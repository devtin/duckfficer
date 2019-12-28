import { obj2dot } from './obj-2-dot.js'
import { find } from './find.js'

/**
 * @method Utils~render
 * @desc Renders handle bars kind-of semantics
 *
 * @param {String} template - Handlebars single-bar template
 * @param {Object} obj
 *
 * @example
 * ```js
 * const obj = {
 *   address: {
 *     line1: 'Brickell Ave'
 *   }
 * }
 *
 * console.log(render(`{ address.line1 }`)) // => 'Brickell Ave'
 * ```
 */

export function render (template, obj) {
  const objProps = obj2dot(obj)
  objProps.forEach(prop => {
    template = template.replace(new RegExp(`{[\\s]*${ prop }[\\s]*}`, 'g'), find(obj, prop))
  })
  return template
}

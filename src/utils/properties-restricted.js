import { forEach } from './for-each'
import { escapeRegExp } from './escape-regex.js'

function getSubProperties (properties, parent) {
  parent = parent.split('.').map(escapeRegExp).join('.')
  const pattern = new RegExp(`^${ parent }\\.`)
  return properties.filter(prop => pattern.test(prop)).map(prop => prop.replace(pattern, ''))
}

/**
 * @method Utils~propertiesRestricted
 * @desc Validates that given `obj`'s properties exists in `properties`.
 * @param {Object} obj - The object to analyze
 * @param {String[]} properties - Properties to validate
 * @param {Object} [options]
 * @param {Boolean} [options.strict=false] - When set to `true`, validates that `obj` actually has all `properties`.
 *
 * @example
 *
 * ```js
 * const user = {
 *   name: 'Martin Rafael',
 *   email: 'tin@devtin.io',
 *   address: {
 *     city: 'Miami, Fl',
 *     zip: 33129,
 *     line1: 'Brickell Ave'
 *   }
 * }
 *
 * console.log(Utils.propertiesRestricted(user, ['name'])) // => false
 * console.log(Utils.propertiesRestricted(user, ['name', 'email', 'address'])) // => true
 * console.log(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'])) // => true
 * console.log(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'], { strict: true })) // => false
 * ```
 */

export function propertiesRestricted (obj, properties, { strict = false } = {}) {
  if (typeof obj !== 'object') {
    return false
  }

  let valid = true

  if (strict) {
    forEach(properties, property => {
      if (property.indexOf('.') > 0) {
        const [parent] = property.split('.')
        return valid = propertiesRestricted(obj[parent], getSubProperties(properties, parent), { strict })
      }

      if (!Object.prototype.hasOwnProperty.call(obj, property)) {
        return valid = false
      }
    })
  }

  if (valid) {
    forEach(Object.keys(obj), property => {
      if (typeof obj[property] === 'object' && !Array.isArray(obj[property])) {
        const propMatch = new RegExp(`^${ escapeRegExp(property) }\\.(.+)$`)
        let defaultApproved = properties.indexOf(property) >= 0
        const childProps = properties
          .filter((v) => {
            return propMatch.test(v)
          })
          .map(v => {
            defaultApproved = false
            return v.replace(propMatch, '$1')
          })

        return valid = defaultApproved || propertiesRestricted(obj[property], childProps)
      }

      if (properties.indexOf(property) === -1) {
        return valid = false
      }
    })
  }

  return valid
}

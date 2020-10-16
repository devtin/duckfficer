import { render } from 'utils/render.js'

/**
 * @typedef {Object} PlainValidationError
 * @property {String} message
 * @property {*} value
 * @property {String} [field]
 * @private
 */

/**
 * @class Schema~ValidationError
 * @classdesc Thrown by {@link Schema}
 * @property {*} value - Given value
 * @property {Schema} field
 * @property {Schema~ValidationError[]} errors - Errors found
 */
export class ValidationError extends Error {
  constructor (message, { errors = [], value, field }) {
    super(render(message, { errors, value, field }))
    this.errors = errors
    this.value = value
    this.field = field
  }

  /**
   * @return {PlainValidationError}
   */
  toJSON () {
    const { message, value } = this
    const res = {
      message,
      value
    }
  }
}

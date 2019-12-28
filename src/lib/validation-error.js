import { render } from 'utils/render.js'

/**
 * @classdesc Thrown by {@link Schema}
 * @property {*} value - Given value
 * @property {Schema} field
 * @property {ValidationError[]} errors - Errors found
 */
export class ValidationError extends Error {
  constructor (message, { errors = [], value, field } = {}) {
    super(render(message, { errors, value, field }))
    this.errors = errors
    this.value = value
    this.field = field
  }
}

/**
 * @class Schema~MethodError
 * @property {String} errorName
 * @property {*} payload
 */
export class MethodError extends Error {
  constructor (errorName, payload) {
    super(errorName)
    this.errorName = errorName
    this.payload = payload
  }
}

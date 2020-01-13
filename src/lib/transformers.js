/**
 * @typedef {Function} Parser
 * @desc Synchronous function that evaluates & sanitizes given value if possible, or throws a {ValidationError} otherwise.
 * @param {*} value - The value being treated
 * @return {*} values - Resulting value
 * @throws ValidationError
 */

/**
 * @typedef {Object} Transformer
 * @property {Parser} parse - Parser function
 * @property {String[]} loaders - Transformer names to pipe the value through prior handling it with the parser function.
 */

/**
 * @type {Object} Transformers
 * @desc Transformers are functions that performs the type casting logic and validation.
 * @property {Transformer} <TransformerName>
 */
export const Transformers = {
  String: {
    parse (v) {
      if (typeof v !== 'string') {
        if (!(typeof v === 'object' && v.hasOwnProperty('toString'))) {
          this.throwError(`Invalid string`, { value: v })
        }

        v = v.toString()
      }

      if (this.settings.minlength) {
        const [minlength, error] = Schema.castThrowable(this.settings.minlength, `Invalid minlength`)
        if (v.length < minlength) {
          this.throwError(error, { value: v })
        }
      }

      if (this.settings.maxlength) {
        const [maxlength, error] = Schema.castThrowable(this.settings.maxlength, `Invalid maxlength`)
        if (v.length > maxlength) {
          this.throwError(error, { value: v })
        }
      }

      if (this.settings.regex) {
        const [regex, error] = Schema.castThrowable(this.settings.regex, `Invalid regex`)

        if (!regex.test(v)) {
          this.throwError(error, { value: v })
        }
      }

      return v
    }
  },
  Boolean: {
    parse (v) {
      return !!v
    }
  },
  Object: {
    parse (value) {
      if (typeof value !== 'object') {
        this.throwError(`Invalid object`, { value })
      }
      return v
    }
  },
  Array: {
    parse (value) {
      if (!Array.isArray(value)) {
        this.throwError(`Invalid array`, { value })
      }
      if (this.settings.items) {
        value = value.map((value, name) => {
          return (new this.constructor(this.settings.items, Object.assign({}, this.settings.items, {
            name,
            parent: this
          }))).parse(value)
        })
      }
      return value
    }
  },
  Set: {
    parse (value) {
      if (Array.isArray(value)) {
        value = new Set(value)
      }
      if (!(value instanceof Set)) {
        this.throwError(`Invalid set`, { value })
      }
      return value
    }
  },
  Number: {
    parse (value) {
      value = Number(value)
      if (isNaN(value)) {
        this.throwError(`Invalid number`, { value })
      }
      return value
    }
  },
  Date: {
    parse (value) {
      value = new Date(Number.isInteger(value) ? value : Date.parse(value))
      if (value.toString() === 'Invalid Date') {
        this.throwError(`Invalid date`, { value })
      }
      return value
    }
  },
  Function: {
    parse (value) {
      if (typeof value !== 'function') {
        this.throwError(`Invalid function`, { value })
      }
      return value
    }
  }
}

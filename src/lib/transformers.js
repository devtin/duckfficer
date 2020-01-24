import { castThrowable } from 'utils/cast-throwable.js'
/**
 * @typedef {Function} Validator
 * @desc Synchronous function that validates that given value is of the expected kind. Throws a {ValidationError} when not.
 * @param {*} value - The value being validated
 * @return {void}
 * @throws ValidationError
 */

/**
 * @typedef {Function} Parser
 * @desc Synchronous function that performs custom logic possibly customized via settings that could transform given
 * value, throwing a {ValidationError} when error.
 * @param {*} value - The value being validated
 * @return {*} Resulting value
 * @throws ValidationError
 */

/**
 * @typedef {Function} ValueCaster
 * @desc Synchronous function that performs some logic attempting to cast given value into expected one. Returns the
 * original value in case it could not be guessed.
 * @param {*} value - The value being casted
 * @return {*} Resulting value
 */

/**
 * @typedef {Object} Transformer
 * @desc A transformer holds the logic of instantiating a data type (casting, validation and parsing).
 * @property {ValueCaster} [cast] - Cast function
 * @property {Parser} [parse] - Parser function
 * @property {Validator} [validate] - Validator function
 * @property {String[]} [loaders] - Transformer names to pipe the value through prior handling it with the parser function.
 */

/**
 * @typedef {Object} Transformers
 * @desc key map object that holds the available Transformer's (types) that can be validated.
 * @property {Transformer} TransformerName - The transformer name
 */

export const Transformers = {
  String: {
    settings: {
      typeError: `Invalid string`,
      autoCast: false
    },
    invalidError: 'Invalid string',
    cast (v) {
      if (v && Object.hasOwnProperty.call(v, 'toString') && typeof v.toString === 'function' && v.toString() !== '[object Object]') {
        v = v.toString()
      }
      return v
    },
    parse (value) {
      if (this.settings.minlength) {
        const [minlength, error] = castThrowable(this.settings.minlength, `Invalid minlength`)

        if (value.length < minlength) {
          this.throwError(error, { value })
        }
      }

      if (this.settings.maxlength) {
        const [maxlength, error] = castThrowable(this.settings.maxlength, `Invalid maxlength`)

        if (value.length > maxlength) {
          this.throwError(error, { value })
        }
      }

      if (this.settings.regex) {
        const [regex, error] = castThrowable(this.settings.regex, `Invalid regex`)

        if (!regex.test(value)) {
          this.throwError(error, { value })
        }
      }

      return value
    },
    validate (value) {
      if (typeof value !== 'string') {
        this.throwError(Transformers.String.invalidError, { value })
      }
    }
  },
  Boolean: {
    invalidError: 'Invalid boolean',
    settings: {
      typeError: `Invalid boolean`,
      autoCast: true
    },
    cast (value) {
      return !!value
    },
    validate (value) {
      if (typeof value !== 'boolean') {
        this.throwError(Transformers.Boolean.invalidError, { value })
      }
    }
  },
  Object: {
    invalidError: 'Invalid object',
    settings: {
      typeError: `Invalid object`
    },
    validate (value) {
      if (typeof value !== 'object') {
        this.throwError(Transformers.Object.invalidError, { value })
      }
    }
  },
  Array: {
    invalidError: `Invalid array`,
    settings: {
      typeError: `Invalid array`
    },
    parse (value) {
      if (this.settings.items) {
        value = value.map((value, name) => {
          return (new this.constructor(this.settings.items, Object.assign({}, this.settings.items, {
            name,
            parent: this
          }))).parse(value)
        })
      }
      return value
    },
    validate (value) {
      if (!Array.isArray(value)) {
        this.throwError(Transformers.Array.invalidError, { value })
      }
    }
  },
  Set: {
    invalidError: `Invalid set`,
    settings: {
      typeError: `Invalid set`,
      autoCast: true
    },
    cast (value) {
      if (Array.isArray(value)) {
        value = new Set(value)
      }

      return value
    },
    validate (value) {
      if (!(value instanceof Set)) {
        this.throwError(Transformers.Set.invalidError, { value })
      }
    }
  },
  Number: {
    invalidError: `Invalid number`,
    settings: {
      typeError: `Invalid number`,
      autoCast: false
    },
    cast (value) {
      return Number(value)
    },
    validate (value) {
      if (typeof value !== 'number' || isNaN(value)) {
        this.throwError(Transformers.Number.invalidError, { value })
      }
    }
  },
  Date: {
    invalidError: `Invalid date`,
    settings: {
      typeError: `Invalid date`,
      autoCast: true
    },
    cast (value) {
      if (value instanceof Date) {
        return value
      }

      const suggested = new Date(Number.isInteger(value) ? value : Date.parse(value))

      if (suggested.toString() !== 'Invalid Date') {
        value = suggested
      }
      return value
    },
    validate (value) {
      if (!(value instanceof Date)) {
        this.throwError(Transformers.Date.invalidError, { value })
      }
    }
  },
  Function: {
    invalidError: `Invalid function`,
    settings: {
      typeError: `Invalid function`
    },
    validate (value) {
      if (typeof value !== 'function') {
        this.throwError(Transformers.Function.invalidError, { value })
      }
    }
  }
}

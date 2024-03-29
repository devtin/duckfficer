import { castThrowable } from 'utils/cast-throwable.js'
import { isNotNullObj } from 'utils/is-not-null-obj'
import { PromiseEach } from 'utils/promise-each'
import { PromiseMap } from 'utils/promise-map'
/**
 * @typedef {Function} Validator
 * @desc function (async permitted) that validates that given value is of the expected kind. Throws a {@link Schema~ValidationError} when not.
 * @param {*} value - The value being validated
 * @param {Object} [options]
 * @param {*} [options.state] - The state passed via the parse function
 * @this {Schema}
 * @return {void}
 * @throws Schema~ValidationError
 */

/**
 * @typedef {Function} Parser
 * @desc function (async permitted) that performs custom logic possibly customized via settings that could transform given
 * value, throwing a {Schema~ValidationError} when error.
 * @param {*} value - The value being validated
 * @param {Object} [options]
 * @param {*} [options.state] - The state passed via the parse function
 * @this {Schema}
 * @return {*} Resulting value
 * @throws Schema~ValidationError
 */

/**
 * @typedef {Function} Caster
 * @desc function (async permitted) that performs some logic attempting to cast given value into expected one. Returns the
 * original value in case it could not be guessed.
 * @param {*} value - The value being casted
 * @param {Object} [options]
 * @param {*} [options.state] - The state passed via the parse function
 * @this {Schema}
 * @return {*} Resulting value
 */

/**
 * @typedef {Object} Transformer
 * @desc A transformer holds the logic of instantiating a data type (casting, validation and parsing).
 * @property {Object} [settings] - Initial transformer settings
 * @property {Caster} [cast] - Cast function
 * @property {Parser} [parse] - Parser function
 * @property {Validator} [validate] - Validator function
 * @property {String[]} [loaders] - Transformer names to pipe the value through prior handling it with the parser function.
 */

/**
 * @constant {Object} Transformers
 * @desc key map object that holds the available Transformer's (types) that can be validated.
 */

export const Transformers = {
  /**
   * @constant {Transformer} Transformers.Array
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid array] - Default error message thrown
   * @property {SchemaSettings} [settings.arraySchema] - Alternatively initializes (which involves validating, casting and parsing)
   * array items using given schema.
   * @property {Parser} parse - Alternatively instantiates array items given an `arraySchema`.
   * @property {Validator} validate - Validates that given value is an array
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   */
  Array: {
    settings: {
      typeError: 'Invalid array'
    },
    async parse (value, opts) {
      if (this.settings.arraySchema) {
        return PromiseMap(value, (item, name) => {
          const { constructor } = this
          const schema = constructor.castSchema(this.settings.arraySchema)
          const getParser = () => {
            if (constructor.guessType(schema) === 'Schema') {
              return constructor.cloneSchema({
                schema,
                name,
                parent: this,
                settings: schema.settings
              })
            }

            return new this.constructor(this.settings.arraySchema, Object.assign({}, this.settings.arraySchema, {
              name,
              parent: this
            }))
          }
          const parser = getParser()
          return parser.parse(item, opts)
        })
      }
      return value
    },
    validate (value) {
      if (!Array.isArray(value)) {
        this.throwError(this.settings.typeError, { value })
      }
    }
  },
  /**
   * @constant {Transformer} Transformers.BigInt
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid bigint] - Default error message thrown
   * @property {Boolean} [settings.autoCast=false] - Whether to automatically cast values or not
   * @property {Validator} validate - Confirms given value is a `BigInt`
   * @property {Caster} cast - Converts `String`s and `Number`s into `BigInt` (if possible)
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
   */
  BigInt: {
    settings: {
      typeError: 'Invalid bigint',
      autoCast: false
    },
    validate (value) {
      if (typeof value !== 'bigint') {
        this.throwError(this.settings.typeError)
      }
    },
    cast (value) {
      if (/^(string|number)$/.test(typeof value)) {
        try {
          value = BigInt(value)
        } catch (e) {
          // shh...
        }
      }
      return value
    }
  },
  /**
   * @constant {Transformer} Transformers.Boolean
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid boolean] - Default error message thrown
   * @property {Boolean} [settings.autoCast=false] - Whether to auto-cast truthy values into `true` and falsy ones into `false`.
   * @property {Caster} cast - Casts truthy values into `true` and falsy ones into `false`
   * @property {Validator} validate - Confirms given value is a `Boolean`.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
   */
  Boolean: {
    settings: {
      typeError: 'Invalid boolean',
      autoCast: false
    },
    cast (value) {
      return !!value
    },
    validate (value) {
      if (typeof value !== 'boolean') {
        this.throwError(this.settings.typeError, { value })
      }
    }
  },
  /**
   * @constant {Transformer} Transformers.Date
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid date] - Default error message thrown
   * @property {Boolean} [settings.autoCast=true]
   * @property {Caster} cast - Casts `String`s into `Date`'s when possible
   * @property {Validator} validate - Validates given value is a `Date`
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
   */
  Date: {
    settings: {
      typeError: 'Invalid date',
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
        this.throwError(this.settings.typeError, { value })
      }
    }
  },
  /**
   * @constant {Transformer} Transformers.Function
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid function] - Default error message thrown
   * @property {Validator} validate - Validates given value is a `Function`
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
   */
  Function: {
    settings: {
      typeError: 'Invalid function'
    },
    validate (value) {
      if (typeof value !== 'function') {
        this.throwError(this.settings.typeError, { value })
      }
    }
  },
  /**
   * @constant {Transformer} Transformers.Map
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid map] - Default error message thrown
   * @property {Boolean} [settings.autoCast=true] - Whether to auto-cast `Object`'s into `Map`'s.
   * @property {Caster} cast - Casts `Object` into `Map`
   * @property {Validator} validate - Validates given values is a `Map`
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  Map: {
    settings: {
      typeError: 'Invalid map',
      autoCast: true
    },
    cast (value) {
      if (isNotNullObj(value) && !(value instanceof Map)) {
        value = new Map(Object.entries(value))
      }

      return value
    },
    validate (value) {
      if (!(value instanceof Map)) {
        this.throwError(this.settings.typeError, { value })
      }
    }
  },
  /**
   * @constant {Transformer} Transformers.Number
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid number] - Default error message thrown
   * @property {String} [settings.minError=minimum accepted value is { value }] - Error message thrown for minimum values
   * @property {String} [settings.maxError=maximum accepted value is { value }] - Error message thrown for maximum values
   * @property {String} [settings.integerError=Invalid integer]
   * @property {String} [settings.min] - Minimum value accepted
   * @property {String} [settings.max] - Maximum value accepted
   * @property {String} [settings.integer] - Whether to only accept integers or not
   * @property {String} [settings.decimalPlaces] - Maximum decimal places to display
   * @property {Boolean} [settings.autoCast=false] - Whether to auto-cast `String`'s with numeric values.
   * @property {Caster} cast - Tries to cast given value into a `Number`
   * @property {Validator} validate - Validates given value is a `Number`
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
   */
  Number: {
    settings: {
      typeError: 'Invalid number',
      minError: 'minimum accepted value is { value }',
      maxError: 'maximum accepted value is { value }',
      integerError: 'Invalid integer',
      min: undefined,
      max: undefined,
      integer: false,
      decimalPlaces: undefined,
      autoCast: false
    },
    cast (value) {
      if (typeof value !== 'number') {
        const altValue = Number(value)

        if (!isNaN(altValue)) {
          return altValue
        }
      }
      return value
    },
    validate (value) {
      if (typeof value !== 'number' || isNaN(value)) {
        this.throwError(this.settings.typeError, { value })
      }

      if (this.settings.integer && !Number.isInteger(value)) {
        this.throwError(this.settings.integerError, { value })
      }

      if (this.settings.min !== undefined && value < this.settings.min) {
        this.throwError(this.settings.minError, { value: this.settings.min })
      }

      if (this.settings.max !== undefined && value > this.settings.max) {
        this.throwError(this.settings.maxError, { value: this.settings.max })
      }
    },
    parse (v) {
      if (this.settings.decimalPlaces !== undefined) {
        const decimalFactor = Math.pow(10, this.settings.decimalPlaces)
        return Math.round(v * decimalFactor) / decimalFactor
      }
      return v
    }
  },
  /**
   * @constant {Transformer} Transformers.Object
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid object] - Default error message thrown
   * @property {String|Schema} [settings.mapSchema] - When available, parses given object's properties with the given
   * schema or transformer.
   * @property {Validator} validate - Confirms given value is an object
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
   */
  Object: {
    settings: {
      typeError: 'Invalid object'
    },
    async parse (value) {
      if (this.settings.mapSchema !== undefined) {
        const newVal = {}
        await PromiseEach(Object.keys(value), async name => {
          const obj = value[name]
          const schema = this.constructor.castSchema(this.settings.mapSchema)
          const parser = this.constructor.guessType(schema) === 'Schema'
            ? this.constructor.cloneSchema({
              schema,
              name,
              settings: schema.settings,
              parent: this
            })
            : value[name] = new this.constructor(this.settings.mapSchema, Object.assign({}, this.settings.mapSchema, {
              name,
              parent: this
            }))

          newVal[name] = await parser.parse(obj)
        })
        return newVal
      }

      return value
    },
    validate (value) {
      if (!isNotNullObj(value)) {
        this.throwError(this.settings.typeError, { value })
      }
    }
  },
  /**
   * @constant {Transformer} Transformers.Set
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid set] - Default error message thrown
   * @property {Boolean} [settings.autoCast=true] - Whether to auto-cast `Array`'s into `Set`'s.
   * @property {Caster} cast - Casts `Array` into `Set`
   * @property {Validator} validate - Validates given values is a `Set`
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
   */
  Set: {
    settings: {
      typeError: 'Invalid set',
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
        this.throwError(this.settings.typeError, { value })
      }
    }
  },
  /**
   * @constant {Transformer} Transformers.String
   * @property {Object} settings - Default transformer settings
   * @property {String} [settings.typeError=Invalid string] - Default error message thrown
   * @property {String} [settings.enumError=Invalid enum option { value }] - Default error message thrown
   * @property {String[]} [settings.enum] - Whether to restrict allowed values to given sample.
   * @property {Boolean} [settings.autoCast=false] - Whether to auto-cast objects with method `toString`.
   * @property {Number|ValueError} [settings.minlength] - Optional minimum length
   * @property {Number|ValueError} [settings.maxlength] - Optional maximum length
   * @property {RegExp|ValueError} [settings.regex] - Optional RegExp to match against given string
   * @property {Boolean} [settings.lowercase] - Optionally convert input string into lowercase
   * @property {Boolean} [settings.uppercase] - Optionally convert input string into uppercase
   * @property {Caster} cast - Basically checks if a value is an object and this object has the method `toString`. If so,
   * calls the method and checks returning value does not look like `[object Object]`; if so, returns whatever value
   * was returned by the method.
   * @property {Validator} validate - Validates given value is a `String`. Additionally, performs built-in validations:
   * minlength, maxlength and regex.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
   */
  String: {
    settings: {
      typeError: 'Invalid string',
      emptyError: 'Value can not be empty',
      enumError: 'Unknown enum option { value }',
      enum: [],
      autoCast: false,
      allowEmpty: true,
      lowercase: false,
      uppercase: false
    },
    cast (v) {
      if (v && Object.hasOwnProperty.call(v, 'toString') && typeof v.toString === 'function' && v.toString() !== '[object Object]') {
        v = v.toString()
      }
      return v
    },
    validate (value) {
      if (typeof value !== 'string') {
        this.throwError(this.settings.typeError, { value })
      }

      if (Array.isArray(this.settings.enum) && this.settings.enum.length > 0 && this.settings.enum.indexOf(value) < 0) {
        this.throwError(this.settings.enumError, { value })
      }

      if (!this.settings.allowEmpty && /^[\s]*$/ms.test(value)) {
        this.throwError(this.settings.emptyError, { value })
      }

      if (this.settings.minlength) {
        const [minlength, error] = castThrowable(this.settings.minlength, 'Invalid minlength')

        if (value.length < minlength) {
          this.throwError(error, { value })
        }
      }

      if (this.settings.maxlength) {
        const [maxlength, error] = castThrowable(this.settings.maxlength, 'Invalid maxlength')

        if (value.length > maxlength) {
          this.throwError(error, { value })
        }
      }

      if (this.settings.regex) {
        const [regex, error] = castThrowable(this.settings.regex, 'Invalid regex')

        if (!regex.test(value)) {
          this.throwError(error, { value })
        }
      }
    },
    parse (v) {
      if (this.settings.lowercase) {
        v = v.toLowerCase()
      }
      if (this.settings.uppercase) {
        v = v.toUpperCase()
      }
      return v
    }
  }
}

/*!
 * duckfficer v2.4.0
 * (c) 2019-2021 Martin Rafael <tin@devtin.io>
 * MIT
 */
import { EventEmitter } from 'events';

/**
 * @method Utils~castArray
 * @desc Makes sure a value is wrapped in an array
 * @param {*} value - The value to wrap in an array. If the value is already an array, it is returned as is.
 * @return {Array}
 */
function castArray (value) {
  return Array.isArray(value) ? value : [value]
}

/**
 * @class Utils
 * @classdesc Set of utilities
 */

/**
 * @method Utils~obj2dot
 * @desc Converts given object's own properties tree in a dot notation array
 * @param {Object} obj
 * @param {String} [parent]
 * @param {String} [separator=.]
 * @return {String[]}
 *
 * @example
 *
 * ```js
 * Utils.obj2dot({
 *   name: 'Martin',
 *   address: {
 *     city: 'Miami',
 *     zip: 305,
 *     line1: 'Brickell ave'
 *   }
 * }) // => ['name', 'address.city', 'address.zip', 'address.line1']
 * ```
 */
function obj2dot (obj, { parent = '', separator = '.' } = {}) {
  const paths = [];
  Object.keys(obj).forEach(prop => {
    if (obj[prop] && typeof obj[prop] === 'object' && !Array.isArray(obj[prop])) {
      return paths.push(...obj2dot(obj[prop], { parent: `${parent}${prop}${separator}`, separator }))
    }
    paths.push(`${parent}${prop}`);
  });
  return paths
}

/**
 * @method Utils~find
 * @desc Deeply finds given dot-notation path of an objects
 * @param {Object} obj
 * @param {String} path - Dot-notation address of the desired property
 * @return {*} Found value
 *
 * @example
 *
 * ```js
 * const obj = {
 *   prop1: {
 *     prop2: {
 *       prop3: 'Martin'
 *     },
 *     firstName: 'Sandy'
 *   }
 * }
 *
 * console.log(find(obj, 'prop1.prop2.prop3') // => Martin
 * console.log(find(obj, 'prop1 .firstName') // => Sandy
 * ```
 */
function find (obj, path) {
  const [prop, ...paths] = Array.isArray(path) ? path : path.split('.');
  if (paths.length > 0 && typeof obj[prop] === 'object') {
    return find(obj[prop], paths)
  }
  return prop ? obj[prop] : obj
}

/**
 * @method Utils~forEach
 * @desc Loops into given array alternatively breaking the look when the callback returns `false` (explicitly).
 * @param {Array} arr
 * @param {Function} cb - Callback function called per item in the array passing the item and index as arguments.
 */
function forEach (arr, cb) {
  for (let i = 0; i < arr.length; i++) {
    if (cb(arr[i], i) === false) {
      break
    }
  }
}

// from https://stackoverflow.com/a/3561711/1064165
function escapeRegExp (s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

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

function render (template, obj) {
  const objProps = obj2dot(obj);
  objProps.forEach(prop => {
    template = template.replace(new RegExp(`{[\\s]*${prop.split('.').map(escapeRegExp).join('.')}[\\s]*}`, 'g'), find(obj, prop));
  });
  return template
}

function isNotNullObj (obj) {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null
}

function getSubProperties (properties, parent) {
  parent = parent.split('.').map(escapeRegExp).join('.');
  const pattern = new RegExp(`^${parent}\\.`);
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
 *     zip: 305,
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

function propertiesRestricted (obj, properties, { strict = false } = {}) {
  if (!isNotNullObj(obj)) {
    return false
  }

  let valid = true;

  if (strict) {
    forEach(properties, property => {
      if (property.indexOf('.') > 0) {
        const [parent] = property.split('.');
        valid = propertiesRestricted(obj[parent], getSubProperties(properties, parent), { strict });
        return valid
      }

      if (!Object.prototype.hasOwnProperty.call(obj, property)) {
        valid = false;
        return valid
      }
    });
  }

  if (valid) {
    forEach(Object.keys(obj), property => {
      if (typeof obj[property] === 'object' && !Array.isArray(obj[property])) {
        const propMatch = new RegExp(`^${escapeRegExp(property)}\\.(.+)$`);
        let defaultApproved = properties.indexOf(property) >= 0;
        const childProps = properties
          .filter((v) => {
            return propMatch.test(v)
          })
          .map(v => {
            defaultApproved = false;
            return v.replace(propMatch, '$1')
          });

        valid = defaultApproved || propertiesRestricted(obj[property], childProps);
        return valid
      }

      if (properties.indexOf(property) === -1) {
        valid = false;
        return valid
      }
    });
  }

  return valid
}

/**
 * Loops through given `arr` of functions, awaiting for each result, alternatively breaking the loop when `breakOnFalse`
 * equals `true` and one of the functions returns `false` explicitly.
 *
 * @param {Function[]} arr
 * @param {Function} fn - callback function to pass iterated items
 * @param {Boolean} [breakOnFalse=false] - whether to stop the loop when false (explicitly) returned
 * @return {Promise<void>}
 */

const PromiseEach = async function (arr, fn, breakOnFalse = false) {
  for (const item of arr) {
    if (await fn(item) === false && breakOnFalse) {
      break
    }
  }
};

/**
 * Loops through given `arr` of functions, awaiting for each result.
 *
 * @param {Function[]} arr
 * @param {Function} fn - callback function to pass iterated items
 * @param {Boolean} [breakOnFalse=false] - whether to stop the loop when false (explicitly) returned
 * @return {Promise<Array>} - array of results
 */

const PromiseMap = async function (arr, fn, breakOnFalse) {
  const newArr = [];
  let index = 0;
  await PromiseEach(arr, async (item) => {
    newArr.push(await fn(item, index++));
  }, breakOnFalse);
  return newArr
};

const index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  castArray: castArray,
  obj2dot: obj2dot,
  find: find,
  forEach: forEach,
  render: render,
  propertiesRestricted: propertiesRestricted,
  PromiseEach: PromiseEach,
  PromiseMap: PromiseMap
});

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
function castThrowable (value, error) {
  if (Array.isArray(value) && value.length === 2) {
    return value
  }

  return [value, error]
}

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

const Transformers = {
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
          const { constructor } = this;
          const schema = constructor.castSchema(this.settings.arraySchema);
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
          };
          const parser = getParser();
          return parser.parse(item, opts)
        })
      }
      return value
    },
    validate (value) {
      if (!Array.isArray(value)) {
        this.throwError(this.settings.typeError, { value });
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
        this.throwError(this.settings.typeError);
      }
    },
    cast (value) {
      if (/^(string|number)$/.test(typeof value)) {
        try {
          value = BigInt(value);
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
        this.throwError(this.settings.typeError, { value });
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

      const suggested = new Date(Number.isInteger(value) ? value : Date.parse(value));

      if (suggested.toString() !== 'Invalid Date') {
        value = suggested;
      }
      return value
    },
    validate (value) {
      if (!(value instanceof Date)) {
        this.throwError(this.settings.typeError, { value });
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
        this.throwError(this.settings.typeError, { value });
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
        value = new Map(Object.entries(value));
      }

      return value
    },
    validate (value) {
      if (!(value instanceof Map)) {
        this.throwError(this.settings.typeError, { value });
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
        const altValue = Number(value);

        if (!isNaN(altValue)) {
          return altValue
        }
      }
      return value
    },
    validate (value) {
      if (typeof value !== 'number' || isNaN(value)) {
        this.throwError(this.settings.typeError, { value });
      }

      if (this.settings.integer && !Number.isInteger(value)) {
        this.throwError(this.settings.integerError, { value });
      }

      if (this.settings.min !== undefined && value < this.settings.min) {
        this.throwError(this.settings.minError, { value: this.settings.min });
      }

      if (this.settings.max !== undefined && value > this.settings.max) {
        this.throwError(this.settings.maxError, { value: this.settings.max });
      }
    },
    parse (v) {
      if (this.settings.decimalPlaces !== undefined) {
        const decimalFactor = Math.pow(10, this.settings.decimalPlaces);
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
        const newVal = {};
        await PromiseEach(Object.keys(value), async name => {
          const obj = value[name];
          const schema = this.constructor.castSchema(this.settings.mapSchema);
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
            }));

          newVal[name] = await parser.parse(obj);
        });
        return newVal
      }

      return value
    },
    validate (value) {
      if (!isNotNullObj(value)) {
        this.throwError(this.settings.typeError, { value });
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
        value = new Set(value);
      }

      return value
    },
    validate (value) {
      if (!(value instanceof Set)) {
        this.throwError(this.settings.typeError, { value });
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
        v = v.toString();
      }
      return v
    },
    validate (value) {
      if (typeof value !== 'string') {
        this.throwError(this.settings.typeError, { value });
      }

      if (Array.isArray(this.settings.enum) && this.settings.enum.length > 0 && this.settings.enum.indexOf(value) < 0) {
        this.throwError(this.settings.enumError, { value });
      }

      if (!this.settings.allowEmpty && /^[\s]*$/ms.test(value)) {
        this.throwError(this.settings.emptyError, { value });
      }

      if (this.settings.minlength) {
        const [minlength, error] = castThrowable(this.settings.minlength, 'Invalid minlength');

        if (value.length < minlength) {
          this.throwError(error, { value });
        }
      }

      if (this.settings.maxlength) {
        const [maxlength, error] = castThrowable(this.settings.maxlength, 'Invalid maxlength');

        if (value.length > maxlength) {
          this.throwError(error, { value });
        }
      }

      if (this.settings.regex) {
        const [regex, error] = castThrowable(this.settings.regex, 'Invalid regex');

        if (!regex.test(value)) {
          this.throwError(error, { value });
        }
      }
    },
    parse (v) {
      if (this.settings.lowercase) {
        v = v.toLowerCase();
      }
      if (this.settings.uppercase) {
        v = v.toUpperCase();
      }
      return v
    }
  }
};

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
class ValidationError extends Error {
  constructor (message, { errors = [], value, field }) {
    super(render(message, { errors, value, field }));
    this.errors = errors;
    this.value = value;
    this.field = field;
  }

  /**
   * @return {PlainValidationError}
   */
  toJSON () {
    const { message, value, field, errors } = this;
    return {
      message,
      value,
      errors: errors ? errors.map(ValidationError.prototype.toJSON.call) : undefined,
      field: field ? field.fullPath : field
    }
  }
}

/**
 * @class Schema~MethodError
 * @property {String} errorName
 * @property {*} payload
 */
class MethodError extends Error {
  constructor (errorName, payload) {
    super(errorName);
    this.errorName = errorName;
    this.payload = payload;
  }
}

const fnProxyStub = async v => Promise.resolve(v);

/**
 * @typedef {Object} Schema~TheSchema
 * @desc This object defines the schema or desired structure of an arbitrary object.
 *
 * @example
 *
 * ```js
 * const MySchemaStructure = {
 *   name: String,
 *   email: String,
 *   address: {
 *     zip: Number,
 *     street: String
 *   }
 * }
 * ```
 */

/**
 * @typedef {Object} Schema~SchemaSettings
 * @desc This object describes the settings of a schema-property and serves as a host to hold possible other settings
 * belonging to its correspondent transformer.
 * @property {String} type - Name of the available {@link Transformers} to use to process the value.
 * @property {Boolean} [required=true] - Whether the property is or not required.
 * @property {Boolean} [allowNull=false] - Whether the allow null values or not.
 * @property {Caster} [cast] - An (optional) additional caster
 * @property {Validator} [validate] - An (optional) additional validator
 * @property {(Function|*)} [default] - Default value when non-passed. Mind this will treat properties as `required=false`.
 * When a function is given, its called using the schema of the property as its `this` object, receiving given value as
 * first argument. Must return the desired default value.
 *
 * @example
 *
 * ```js
 * new Schema({
 *   // when an SchemaSetting is an object it will have a property named `type`.
 *   name: {
 *     type: String, // < it is a SchemaSetting since it has a property called type
 *     validate (value) {
 *       if (/^[a-z]/.test(value)) {
 *         throw new Error(`Start your name in uppercase, please`)
 *       }
 *     }
 *   }
 * })
 * ```
 */

/**
 * @typedef {Object} Method
 * @property {Schema|Object} input - method input payload validation
 * @property {Schema|Object} output - method output payload validation
 * @property {Function} handler - function to be called (this arg is the value of the object)
 */

/**
 * @classdesc Orchestrates the validation of a data schema
 * @property {Schema} [parent] - Nested objects will have a {@link Schema} in this property
 * @property {String} name - Nested objects will have the name of it's containing property
 * @property {Schema~SchemaSettings} schema - The schema
 */
class Schema {
  /**
   * @constructor
   * @description Sets the environment up:
   * - Stores the schema locally
   * - Guesses the type of the schema
   * @param {Schema~TheSchema|Object|Array} schema
   * @param {Object} [options]
   * @param {String} [options.name] - Alternative name of the object
   * @param {Object} [options.defaultValues] - Default values to override the schema with
   * @param {Method} [options.methods]
   * @param {Schema} [options.parent]
   * @param {Caster} [options.cast] - Schema caster
   * @param {Object} [options.settings] - Initial settings
   * @param {Validator} [options.validate] - Final validation
   */
  constructor (schema, { name = '', defaultValues = {}, methods = {}, parent, validate, cast, settings = {} } = {}) {
    this._settings = settings;

    if (Array.isArray(schema) && schema.length === 1) {
      schema = schema[0];
    }

    this._methods = methods;
    this.schema = schema;
    this.parent = parent;
    // schema level validation: validates using the entire value (maybe an object) of this path
    this._validate = validate;
    // schema level c: validates using the entire value (object) of this path
    this._cast = cast;
    this.name = name;
    this.originalName = this.name;
    this.type = Schema.guessType(schema);
    this.resetCurrentType();
    this.children = [];
    this._defaultSettings = {
      required: true,
      allowNull: false,
      default: undefined
    };
    this._defaultValues = defaultValues;
    /**
     * @typedef {Object} virtual
     * @property {Function} get
     * @property {Function} set
     */
    this.virtuals = [];

    /**
     * @property {String} type - The schema type. Options vary according to available Transformers. Could be 'Schema'
     * for nested objects.
     * @property {Schema[]} [children] - For nested objects
     */

    if (Schema.isNested(schema)) {
      this.children = this._parseSchema(schema);
    } else {
      this._settings = typeof schema === 'object' ? Object.assign({}, this._settings, { required: schema.default === undefined }, schema) : this._settings;
      delete this._settings.type;
    }

    if (this.settings.default !== undefined && this.settings.required) {
      throw new Error(`Remove either the 'required' or the 'default' option for property ${this.fullPath}.`)
    }

    this._defaultSettings.default = this.getDefault();
  }

  resetCurrentType () {
    this.currentType = castArray(this.type)[0];
  }

  get hasChildren () {
    return this.children.length > 0
  }

  get validate () {
    return this._validate || fnProxyStub
  }

  get cast () {
    return this._cast || fnProxyStub
  }

  get settings () {
    if (!this.hasChildren && Transformers[this.currentType] && Transformers[this.currentType].settings) {
      return Object.assign(this._defaultSettings, Transformers[this.currentType].settings, this._settings)
    }
    return Object.assign(this._defaultSettings, this._settings)
  }

  static castSchema (obj) {
    if (obj instanceof Schema) {
      return obj
    }
    if (typeof obj === 'object' && Schema.guessType(obj.type) === 'Schema') {
      return obj.type
    }
    return obj
  }

  static castSettings (obj) {
    if (obj instanceof Schema) {
      return obj.settings
    }
    const settings = Object.assign({}, obj);
    delete settings.type;
    return settings
  }

  /**
   * Checks whether given obj is valid compared to the schema
   *
   * @param obj
   * @return {Boolean} whether the obj is valid or not
   */
  async isValid (obj) {
    try {
      await this.parse(obj);
      return true
    } catch (err) {
      return false
    }
  }

  _parseSchema (obj) {
    return Object.keys(obj).map((prop) => {
      const objDesc = Object.getOwnPropertyDescriptor(obj, prop);

      if (typeof objDesc.get === 'function' || typeof objDesc.set === 'function') {
        this.virtuals.push({
          path: prop,
          getter: objDesc.get,
          setter: objDesc.set
        });
        /* eslint-disable-next-line */
        return
      }

      if (Schema.guessType(obj[prop]) === 'Schema') {
        return Schema.cloneSchema({
          schema: Schema.castSchema(obj[prop]),
          settings: Schema.castSettings(obj[prop]),
          name: prop,
          parent: this
        })
      }
      return new Schema(obj[prop], { name: prop, parent: this })
    }).filter(Boolean)
  }

  /**
   * Checks whether a given object is a nested object
   *
   * @param {Object} obj
   * @return {boolean}
   */
  static isNested (obj) {
    return Schema.guessType(obj) === 'Object' && (!obj.type || Schema.isDeepType(obj.type))
  }

  static isDeepType (schemaType) {
    return !(schemaType instanceof Schema) && typeof schemaType === 'object' && schemaType.type
  }

  static guessType (value) {
    if (value instanceof Schema) {
      return 'Schema'
    }

    if (typeof value === 'function') {
      return value.name
    }

    if (typeof value === 'object' && value.type && !Schema.isDeepType(value.type)) {
      return Schema.guessType(value.type)
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      return 'Object'
    }

    if (Array.isArray(value)) {
      value = value.map(Schema.guessType);
    }

    return value
  }

  get fullPath () {
    return (this.parent && this.parent.fullPath ? `${this.parent.fullPath}.` : '') + this.name
  }

  get ownPaths () {
    return this.children.map(({ name }) => name)
  }

  /**
   * @property {String[]} paths - Contains paths
   */
  get paths () {
    const foundPaths = [];

    this.name && foundPaths.push(this.name);

    if (this.hasChildren) {
      this.children.forEach(({ paths }) => {
        paths.forEach(path => {
          foundPaths.push((this.name ? `${this.name}.` : '') + path);
        });
      });
    }

    return foundPaths
  }

  static cloneSchema ({ schema, name, parent, settings = {}, defaultValues, type, cast, validate, currentType }) {
    const clonedSchema = Object.assign(Object.create(Object.getPrototypeOf(schema)), schema, {
      name: name !== undefined ? name : schema.name,
      type: type || schema.type,
      currentType: currentType || schema.currentType,
      _cast: (cast || cast === false ? cast : schema._cast),
      _validate: (validate || validate === false ? validate : schema._validate),
      parent,
      cloned: true,
      _defaultValues: defaultValues || schema._defaultValues,
      _settings: Object.assign({}, schema._settings, settings)
    });
    if (clonedSchema.children) {
      clonedSchema.children = clonedSchema.children.map(theSchema => Schema.cloneSchema({
        schema: theSchema,
        parent: clonedSchema
      }));
    }
    return clonedSchema
  }

  /**
   * Finds schema in given path
   * @param {String} pathName - Dot notation path
   * @return {Schema|Schema[]}
   */
  schemaAtPath (pathName) {
    const [path, rest] = pathName.split(/\./);
    let schema;
    forEach(this.children, possibleSchema => {
      if (possibleSchema.name === path) {
        schema = possibleSchema;
        return false
      }
    });

    if (rest) {
      return schema.schemaAtPath(rest)
    }

    return schema
  }

  /**
   * Checks whether the schema contains given fieldName
   * @param fieldName
   * @param {Boolean} [deep=false] - whether to validate the path deeply
   * @return {Boolean}
   */
  hasField (fieldName, deep = false) {
    return this.paths.indexOf(deep ? fieldName : fieldName.replace(/\..*$/, '')) >= 0
  }

  /**
   * Validates if the given object have a structure valid for the schema in subject
   * @param {Object} obj - The object to evaluate
   * @throws {Schema~ValidationError} when the object does not match the schema
   */
  structureValidation (obj) {
    if (!isNotNullObj(obj) || !this.hasChildren) {
      return
    }

    const unknownFields = [];
    if (!propertiesRestricted(obj, this.ownPaths)) {
      if (obj) {
        obj2dot(obj).forEach(field => {
          if (
            this.hasChildren &&
            !this.hasField(field)
          ) {
            unknownFields.push(new Error(`Unknown property ${this.name ? this.name + '.' : ''}${field}`));
          }
        });
      }
    }

    this.ownPaths.forEach((path) => {
      try {
        this.schemaAtPath(path).structureValidation(obj[path]);
      } catch (err) {
        const { errors } = err;
        unknownFields.push(...errors);
      }
    });

    if (unknownFields.length > 0) {
      throw new ValidationError('Invalid object schema' + (this.parent ? ` in property ${this.fullPath}` : ''), {
        errors: unknownFields,
        value: obj,
        field: this
      })
    }
  }

  async fullCast (v, { state }) {
    v = await this.cast(v, { state });
    if (typeof v === 'object' && v && this.hasChildren) {
      await PromiseEach(this.children, async child => {
        const parsedValue = await child.fullCast(v[child.name], { state });
        if (parsedValue !== undefined) {
          v[child.name] = parsedValue;
        }
      });
    }
    return v
  }

  static ensureSchema (obj) {
    return obj instanceof Schema ? obj : new Schema(obj)
  }

  /**
   * Validates schema structure, casts, validates and parses  hooks of every field in the schema
   * @param {Object} [v] - The object to evaluate
   * @param {Object} [options]
   * @param {Object} [options.state] - State to pass through the lifecycle
   * @param {Boolean} [options.virtualsEnumerable] - whether to set virtuals enumerable
   * @return {Object} The sanitized object
   * @throws {ValidationError} when given object does not meet the schema
   */
  async parse (v, { state = {}, virtualsEnumerable = false } = {}) {
    // schema-level casting
    // todo: cast children schemas
    v = await this.fullCast(v, { state });

    if (!this.parent) {
      this.structureValidation(v);
    }

    if (this.hasChildren) {
      v = await this.runChildren(v, { state });
    } else {
      // console.log(this)
      v = await this.parseProperty(this.type, v, { state });

      /*
      Value here would be:
      - casted
      - validated
      - parsed
       */
    }

    // schema-level validation
    await this.validate(v, { state });

    // append virtuals
    if (isNotNullObj(v)) {
      this.virtuals.forEach(({ path, getter, setter }) => {
        Object.defineProperties(v, {
          [path]: { get: getter, set: setter, enumerable: virtualsEnumerable }
        });
      });
    }

    // event emitter
    if (isNotNullObj(v) || Array.isArray(v)) {
      const emitter = new EventEmitter();
      Object.defineProperties(v, {
        $on: {
          value: emitter.on.bind(emitter),
          writable: true,
          enumerable: false
        }
      });

      // append methods
      Object.keys(this._methods).forEach(methodName => {
        const inputValidation = this._methods[methodName].input;
        const outputValidation = this._methods[methodName].output;
        const methodIsEnumerable = this._methods[methodName].enumerable;
        const methodEvents = this._methods[methodName].events;
        const methodErrors = this._methods[methodName].errors;

        const methodFn = async (...args) => {
          if (inputValidation) {
            try {
              args[0] = await Schema.ensureSchema(inputValidation).parse(args[0]);
            } catch (err) {
              throw new ValidationError(`Invalid input at method ${methodName}`, { errors: err.errors.length > 0 ? err.errors : [err], value: args[0] })
            }
          }

          const thisArg = {
            async $emit (eventName, payload) {
              if (methodEvents) {
                if (!methodEvents[eventName]) {
                  throw new Error(`Unknown event ${eventName}`)
                }

                try {
                  payload = await Schema.ensureSchema(methodEvents[eventName]).parse(payload);
                } catch (err) {
                  throw new ValidationError(`Invalid payload for event ${eventName}`, {
                    errors: err.errors.length > 0 ? err.errors : [err]
                  })
                }
              }
              emitter.emit(eventName, payload);
            },
            async $throw (errorName, payload) {
              if (methodErrors) {
                if (!methodErrors[errorName]) {
                  throw new MethodError(`Unknown error ${errorName}`)
                }

                try {
                  payload = methodErrors[errorName] ? await Schema.ensureSchema(methodErrors[errorName]).parse(payload) : payload;
                } catch (err) {
                  throw new ValidationError(`Invalid payload for error ${errorName}`, {
                    errors: err.errors.length > 0 ? err.errors : [err]
                  })
                }
              }
              throw new MethodError(errorName, payload)
            },
            $field: v
          };
          const result = await (this._methods[methodName].handler || this._methods[methodName]).apply(thisArg, args);

          if (outputValidation) {
            try {
              return await Schema.ensureSchema(outputValidation).parse(result)
            } catch (err) {
              throw new ValidationError(`Invalid output at method ${methodName}`, { errors: err.errors.length > 0 ? err.errors : [err] })
            }
          }

          return result
        };

        Object.defineProperty(v, methodName, {
          value: methodFn,
          writable: true,
          enumerable: methodIsEnumerable
        });
      });
    }

    return v
  }

  /**
   *
   * @param {*} v
   * @param {Schema~SchemaSettings[]} loaders
   * @param {*} state
   * @return {*}
   */
  async processLoaders (v, { loaders, state }) {
    // throw new Error(`uya!`)
    await PromiseEach(castArray(loaders), async loaderSchema => {
      // console.log({ loaderSchema })
      if (typeof loaderSchema !== 'object') {
        loaderSchema = { type: loaderSchema };
      }

      const type = Schema.guessType(loaderSchema);
      const clone = Schema.cloneSchema({ schema: this, type, currentType: type, cast: false, validate: false });

      if (type !== 'Schema') {
        clone._settings = Object.assign({}, clone._settings, {
          loaders: undefined,
          cast: undefined,
          validate: undefined
        }, loaderSchema);
      }

      v = await clone.parseProperty(type, v, { state });
    });

    return v
  }

  async parseProperty (type, v, { state = {} } = {}) {
    if (v === null && this.settings.allowNull) {
      return v
    }

    if (Array.isArray(type)) {
      let parsed = false;
      let result;
      await PromiseEach(type, async t => {
        try {
          this.currentType = t;
          result = await this.parseProperty(t, v, { state });
          parsed = true;
          return false
        } catch (err) {
          // shh...
        }
      }, true);

      this.resetCurrentType();

      if (!parsed) {
        this.throwError(`Could not resolve given value type${this.fullPath ? ' in property ' + this.fullPath : ''}. Allowed types are ${type.slice(0, -1).join(', ') + ' and ' + type[type.length - 1]}`, { value: v });
      }
      return result
    }
    const transformer = Transformers[type];

    if (!transformer) {
      this.throwError(`Don't know how to resolve ${type} in property ${this.fullPath}`, { value: v });
    }

    if (this.settings.default !== undefined && v === undefined) {
      v = typeof this.settings.default === 'function' ? await this.settings.default.call(this, { state }) : this.settings.default;
    }

    // run user-level loaders (inception transformers)
    if (this.settings.loaders) {
      v = await this.processLoaders(v, { loaders: this.settings.loaders, state }); // infinite loop
    }

    // run transformer-level loaders
    if (transformer.loaders) {
      v = await this.processLoaders(v, { loaders: transformer.loaders, state });
    }

    v = await this.runTransformer({ method: 'cast', transformer: this.settings, payload: v, state });

    // run transformer caster
    if (this.settings.autoCast) {
      v = await this.runTransformer({ method: 'cast', transformer, payload: v, state });
    }

    if (v === undefined && !this.settings.required) {
      return
    }

    if (v === undefined && this.settings.required) {
      const [required, error] = castThrowable(this.settings.required, `Property ${this.fullPath} is required`);
      required && this.throwError(error, { value: v });
    }

    // run transformer validator
    await this.runTransformer({ method: 'validate', transformer, payload: v, state });
    await this.runTransformer({ method: 'validate', transformer: this.settings, payload: v, state });

    // run transformer parser
    return this.runTransformer({ method: 'parse', transformer, payload: v, state })
  }

  async runChildren (obj, { method = 'parse', state = {} } = {}) {
    if (!this.settings.required && obj === undefined) {
      return
    }
    const resultingObject = {};
    const errors = [];

    // error trapper
    const sandbox = async (fn) => {
      try {
        await fn();
      } catch (err) {
        if (err instanceof ValidationError) {
          if (err instanceof ValidationError && err.errors.length > 0) {
            errors.push(...err.errors);
          } else {
            errors.push(err);
          }
        } else {
          errors.push(err);
        }
      }
    };

    await PromiseEach(this.ownPaths, async pathName => {
      const schema = this.schemaAtPath(pathName.replace(/\..*$/));
      const input = isNotNullObj(obj) ? obj[schema.name] : undefined;

      await sandbox(async () => {
        const val = await schema[method](input, { state });
        if (val !== undefined) {
          Object.assign(resultingObject, { [schema.name]: val });
        }
      });
    });

    if (errors.length > 0) {
      throw new ValidationError('Data is not valid', { errors })
    }

    return resultingObject
  }

  /**
   * Runs given method found in transformer
   * @param method
   * @param transformer
   * @param {Object} [options]
   * @param {*} payload
   * @param {Object} [state]
   * @return {*}
   */
  runTransformer ({ method, transformer, payload, state }) {
    if (!transformer[method]) {
      return payload
    }

    return transformer[method].call(this, payload, { state })
  }

  throwError (message, { errors, value } = {}) {
    this.resetCurrentType();
    throw new ValidationError(message, { errors, value, field: this })
  }

  getDefault (child) {
    if (this.parent) {
      return this.parent.getDefault(child ? `${this.name}.${child}` : this.name)
    }

    if (child) {
      return find(this._defaultValues, child)
    }
  }
}

export { Schema, Transformers, index as Utils, ValidationError };

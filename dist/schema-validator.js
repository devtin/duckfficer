/*!
 * @devtin/schema-validator v1.0.0
 * (c) 2019 Martin Rafael <tin@devtin.io>
 * MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Makes sure a value is wrapped in an array
 * @param v
 * @return {Array}
 */
function castArray (v) {
  return Array.isArray(v) ? v : [v]
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
 *     zip: 33129,
 *     line1: 'Brickell ave'
 *   }
 * }) // => ['name', 'address.city', 'address.zip', 'address.line1']
 * ```
 */
function obj2dot (obj, { parent = '', separator = '.' } = {}) {
  const paths = [];
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && !Array.isArray(obj[prop])) {
      return paths.push(...obj2dot(obj[prop], { parent: `${ parent }${ prop }${ separator }`, separator }))
    }
    paths.push(`${ parent }${ prop }`);
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
 *       prop3: 'Martin
 *     },
 *     firstName: 'Sandy'
 *   }
 * }
 *
 * console.log(find(obj, 'prop1.prop2.prop3') // => Martin
 * console.log(find(obj, 'prop1.prop2.firstName') // => Sandy
 * ```
 */
function find (obj, path) {
  const [prop, paths] = path.split(/\./);
  if (paths && typeof obj[prop] === 'object') {
    return find(obj[prop], paths)
  }
  return obj[prop]
}

/**
 * Loops into given array alternatively breaking the look when the callback returns `false` (explicitly).
 * @param {Array} arr
 * @param {Function} cb - Callback function called per item in the array passing the item and index as arguments.
 */
function forEach(arr, cb) {
  for (let i = 0; i < arr.length; i++) {
    if (cb(arr[i], i) === false) {
      break
    }
  }
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
    template = template.replace(new RegExp(`{[\\s]*${ prop }[\\s]*}`, 'g'), find(obj, prop));
  });
  return template
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

function  propertiesRestricted (obj, properties, { strict = false } = {}) {
  if (typeof obj !== 'object') {
    return false
  }

  let valid = true;

  if (strict) {
    forEach(properties, property => {
      if (property.indexOf('.') > 0) {
        const [parent, childrens] = property.split(/\./);
        return valid = propertiesRestricted(obj[parent], [childrens], { strict })
      }

      if (obj.hasOwnProperty(property)) {
        return valid = false
      }
    });
  }

  if (valid) {
    forEach(Object.keys(obj), property => {
      if (typeof obj[property] === 'object' && !Array.isArray(obj[property])) {
        const propMatch = new RegExp(`^${ property }\.(.+)$`);
        let defaultApproved = properties.indexOf(property) >= 0;
        const childProps = properties
          .filter((v) => {
            return propMatch.test(v)
          })
          .map((v) => {
            defaultApproved = false;
            return v.replace(propMatch, '$1')
          });

        return valid = defaultApproved || propertiesRestricted(obj[property], childProps)
      }

      if (properties.indexOf(property) === -1) {
        return valid = false
      }
    });
  }

  return valid
}



var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  castArray: castArray,
  obj2dot: obj2dot,
  find: find,
  forEach: forEach,
  render: render,
  propertiesRestricted: propertiesRestricted
});

/**
 * @classdesc Thrown by {@link Schema}
 * @property {*} value - Given value
 * @property {Schema} field
 * @property {ValidationError[]} errors - Errors found
 */
class ValidationError extends Error {
  constructor (message, { errors = [], value, field } = {}) {
    super(render(message, { errors, value, field }));
    this.errors = errors;
    this.value = value;
    this.field = field;
  }
}

const Transformers = {
  /**
   * @return {String}
   */
  String: {
    /**
     * Maybe cast value could be async and there is where the beauty comes!
     * @return {String}
     * @throws {Error} when given value can not be casted
     */
    parse (v) {
      if (typeof v !== 'string') {
        if (!(typeof v === 'object' && v.hasOwnProperty('toString'))) {
          this.throwError(`Invalid string`, { value: v });
        }

        v = v.toString();
      }

      if (this.settings.minlength) {
        const [minlength, error] = Schema.castThrowable(this.settings.minlength, `Invalid minlength`);
        if (v.length < minlength) {
          this.throwError(error, { value: v });
        }
      }

      if (this.settings.maxlength) {
        const [maxlength, error] = Schema.castThrowable(this.settings.maxlength, `Invalid maxlength`);
        if (v.length > maxlength) {
          this.throwError(error, { value: v });
        }
      }

      if (this.settings.regex) {
        const [regex, error] = Schema.castThrowable(this.settings.regex, `Invalid regex`);

        if (!regex.test(v)) {
          this.throwError(error, { value: v });
        }
      }

      return v
    }
  },
  Number: {
    parse (v) {
      v = Number(v);
      if (isNaN(v)) {
        throw new Error(`Invalid number`)
      }
      return v
    }
  },
  Date: {
    parse (v) {
      v = new Date(Number.isInteger(v) ? v : Date.parse(v));
      if (!(v instanceof Date)) {
        throw new Error(`Invalid date`)
      }
      return v
    }
  },
  Function: {
    parse (v) {
      if (typeof v !== 'function') {
        throw new Error(`Invalid function`)
      }
      return v
    }
  }
};

/**
 * @typedef {Object} Schema~SchemaModel
 * @desc This object defines the desired structure of our schema. It must contain as many properties
 * as fields we want to validate. Each property must be either a {@link Field} or a {@link Schema} for
 * nested objects.
 * @property {SchemaModel} theFieldName - Add as many property schemas as you need in order to build your validation model
 */

/**
 * @classdesc Orchestrates the validation of a data schema
 */
class Schema {
  /**
   * @constructor
   * @param {SchemaModel} schema
   * @param {Object} [options]
   * @param {String} [options.name] - Alternative name of the object
   * @param {Schema} [options.parent]
   */
  constructor (schema, { name, parent } = {}) {
    /**
     * @property {Object} settings - Additional settings for schema
     */
    this.settings = {};

    this.schema = schema;

    /**
     * @property {Schema} [parent] - Nested objects will have a {@link Schema} in this property
     */
    this.parent = parent;

    /**
     * @property {String} name - Nested objects will have the name of it's containing property
     */
    this.name = name || '';

    /**
     * @property {String} type - The schema type. Options vary according to available Transformers. Could be 'Schema'
     * for nested objects.
     * @property {Schema[]} [children] - For nested objects
     */

    if (Schema.isNested(schema)) {
      this.type = this.constructor.name;
      this.children = this._parseSchema(schema);
    } else {
      // primitive
      this.type = Schema.guessType(schema);
      this.settings = typeof schema === 'object' ? Object.assign({}, schema) : {};
      delete this.settings.type;
    }
  }

  static castThrowable (value, error) {
    if (Array.isArray(value) && value.length === 2) {
      return value
    }

    return [value, error]
  }

  _parseSchema (obj) {
    if (!Schema.isNested(obj)) {
      return []
    }
    return Object.keys(obj).map((prop) => {
      if (obj[prop] instanceof Schema) {
        const schemaClone = Object.assign(Object.create(Object.getPrototypeOf(obj[prop])), obj[prop], {
          name: prop,
          parent: this,
          settings: this.settings
        });
        schemaClone.name = prop;
        schemaClone.parent = this;
        // schemaClone.settings = this.settings
        return schemaClone
      }
      return new Schema(obj[prop], { name: prop, parent: this })
    })
  }

  /**
   * Checks whether a given object is a nested object
   *
   * @param {Object} obj
   * @return {boolean}
   */
  static isNested (obj) {
    return typeof obj === 'object' && !obj.type
  }

  static guessType (value) {
    if (typeof value === 'function') {
      return value.name
    }

    if (typeof value === 'object' && value.type) {
      return Schema.guessType(value.type)
    }

    // serialized
    if (typeof value === 'string') {
      return value
    }

    // nested schema
    return 'Schema'
  }

  get fullPath () {
    return (this.parent && this.parent.fullPath ? `${ this.parent.fullPath }.` : '') + this.name
  }

  /**
   * @property {String[]} paths - Contains paths
   */
  get ownPaths () {
    return this.children.map(({ name }) => name)
  }

  /**
   * @property {String[]} paths - Contains paths
   */
  get paths () {
    const foundPaths = [];

    if (this.children) {
      this.children.forEach(({ paths }) => {
        paths.forEach(path => {
          foundPaths.push((this.name ? `${ this.name }.` : '') + path);
        });
      });
    } else {
      foundPaths.push(this.name);
    }

    return foundPaths
  }

  schemaAtPath (pathName) {
    const [path] = pathName.split(/\./);
    let schema;
    forEach(this.children, possibleSchema => {
      if (possibleSchema.name === path) {
        schema = possibleSchema;
        return false
      }
    });

    return schema
  }

  /**
   * Checks whether the schema contains given fieldName
   * @param fieldName
   * @return {Boolean}
   */
  hasField (fieldName) {
    return this.paths.indexOf(fieldName) >= 0
  }

  /**
   * Validates if the given object have a structure valid for the schema in subject
   * @param {Object} obj - The object to evaluate
   * @throws {ValidationError}
   */
  structureValidation (obj) {
    if (!obj) {
      return true
    }
    if (!propertiesRestricted(obj, this.ownPaths)) {
      const unknownFields = [];
      if (obj) {
        obj2dot(obj).forEach(field => {
          if (!this.hasField(field)) {
            unknownFields.push(new Error(`Unknown property ${ field }`));
          }
        });
      }
      throw new ValidationError(`Invalid object schema`, { errors: unknownFields, value: obj })
    }
  }

  /**
   * Validates schema structure and synchronous hooks of every field in the schema
   * @param {Object} v - The object to evaluate
   * @return {Object} The sanitized object
   * @throws {ValidationError}
   */
  parse (v) {
    if (this.children) {
      let res;
      try {
        res = this._parseNested(v);
      } catch (err) {
        throw err
      }
      return res
    }

    // custom manipulators
    if (this.settings.default && !v) {
      v = typeof this.settings.default === 'function' ? this.settings.default(v) : this.settings.default;
    }

    const transformer = Transformers[this.type];

    if (!transformer) {
      throw new Error(`Don't know how to resolve ${ this.type }`)
    }

    if (v === undefined && !this.settings.required) {
      return
    }

    if (!v && this.settings.required) {
      const [required, error] = Schema.castThrowable(this.settings.required, `Field ${ this.fullPath } is required`);
      required && this.throwError(error, { value: v });
    }

    // console.log({ transformer })

    if (transformer.loaders) {
      forEach(castArray(transformer.loaders), loader => {
        const loaderName = Schema.guessType(loader);
        if (!Transformers[loaderName]) {
          throw new Error(`Don't know how to resolve ${ loaderName }`)
        }
        v = Transformers[loaderName].parse.call(this, v);
      });
    }

    return transformer.parse.call(this, v)
  }

  _parseNested (obj) {
    this.structureValidation(obj);
    const resultingObject = {};
    const errors = [];

    this.ownPaths.forEach(pathName => {
      const schema = this.schemaAtPath(pathName);

      try {
        const val = schema.parse(typeof obj === 'object' ? obj[schema.name] : undefined);
        if (val !== undefined) {
          Object.assign(resultingObject, { [schema.name]: val });
        }
      } catch (err) {
        if (err instanceof ValidationError && err.errors.length > 0) {
          errors.push(...err.errors);
        } else {
          errors.push(err);
        }
      }
    });

    if (errors.length > 0) {
      throw new ValidationError(`Data is not valid`, { errors })
    }

    return Object.keys(resultingObject).length > 0 ? resultingObject : undefined
  }

  throwError (message, { errors, value } = {}) {
    throw new ValidationError(message, { errors, value, field: this })
  }
}

exports.Schema = Schema;
exports.Transformers = Transformers;
exports.Utils = index;
exports.ValidationError = ValidationError;

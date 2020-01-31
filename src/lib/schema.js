import { propertiesRestricted } from 'utils/properties-restricted'
import { castArray } from 'utils/cast-array'
import { obj2dot } from 'utils/obj-2-dot'
import { ValidationError } from './validation-error.js'
import { forEach } from 'utils/for-each.js'
import { castThrowable } from 'utils/cast-throwable'
import { Transformers } from './transformers.js'

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
 * @property {Caster} [cast] - Optional caster
 * @property {Validator} [validate] - Optional validator
 * @property {Parser} [parse] - Optional parser
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
 * @classdesc Orchestrates the validation of a data schema
 * @property {Schema} [parent] - Nested objects will have a {@link Schema} in this property
 * @property {String} name - Nested objects will have the name of it's containing property
 * @property {Schema~SchemaSettings} schema - The schema
 */
export class Schema {
  /**
   * @constructor
   * @param {TheSchema} schema
   * @param {Object} [options]
   * @param {String} [options.name] - Alternative name of the object
   * @param {Schema} [options.parent]
   */
  constructor (schema, { name, parent } = {}) {
    this._settings = {
      required: true,
      default: undefined
    }

    this.schema = schema
    this.parent = parent
    this.name = name || ''

    /**
     * @property {String} type - The schema type. Options vary according to available Transformers. Could be 'Schema'
     * for nested objects.
     * @property {Schema[]} [children] - For nested objects
     */

    if (Schema.isNested(schema)) {
      this.type = this.constructor.name
      this.children = this._parseSchema(schema)
    } else {
      // primitive
      this.type = Schema.guessType(schema)
      this._settings = typeof schema === 'object' ? Object.assign({}, this._settings, { required: schema.default === undefined }, schema) : this._settings
      delete this._settings.type
    }

    if (this._settings.default !== undefined && this._settings.required) {
      throw new Error(`Remove either the 'required' or the 'default' option for property ${ this.fullPath }.`)
    }
  }

  get settings () {
    if (!this.children && Transformers[this.type] && Transformers[this.type].settings) {
      return Object.assign({}, Transformers[this.type].settings, this._settings)
    }
    return this._settings
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
        })
        schemaClone.name = prop
        schemaClone.parent = this
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
    const foundPaths = []

    if (this.children) {
      this.children.forEach(({ paths }) => {
        paths.forEach(path => {
          foundPaths.push((this.name ? `${ this.name }.` : '') + path)
        })
      })
    } else {
      foundPaths.push(this.name)
    }

    return foundPaths
  }

  schemaAtPath (pathName) {
    const [path] = pathName.split(/\./)
    let schema
    forEach(this.children, possibleSchema => {
      if (possibleSchema.name === path) {
        schema = possibleSchema
        return false
      }
    })

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
      const unknownFields = []
      if (obj) {
        obj2dot(obj).forEach(field => {
          if (!this.hasField(field)) {
            unknownFields.push(new Error(`Unknown property ${ field }`))
          }
        })
      }
      throw new ValidationError(`Invalid object schema`, { errors: unknownFields, value: obj })
    }
  }

  /**
   * Validates schema structure and synchronous hooks of every field in the schema
   * @param {Object} [v] - The object to evaluate
   * @return {Object} The sanitized object
   * @throws {ValidationError} when given object does not meet the schema
   */
  parse (v) {
    if (this.children) {
      return this._parseNested(v)
    }

    // custom manipulators
    if (this.settings.default !== undefined && v === undefined) {
      v = typeof this.settings.default === 'function' ? this.settings.default.call(this, v) : this.settings.default
    }

    return this._run(this.type, v)
  }

  _run (type, v, runLoaders = true) {
    const transformer = Transformers[type]

    if (!transformer) {
      throw new Error(`Don't know how to resolve ${ type }`)
    }

    if (v === undefined && !this.settings.required) {
      return
    }

    if (v === undefined && this.settings.required) {
      const [required, error] = castThrowable(this.settings.required, `Property ${ this.fullPath } is required`)
      required && this.throwError(error, { value: v })
    }

    const processLoaders = (loaders, runLoaders = false) => {
      forEach(castArray(loaders), loader => {
        const type = Schema.guessType(loader)
        const clone = Object.assign(Object.create(this), this)
        if (type !== 'Schema' && typeof loader === 'object') {
          clone._settings = Object.assign({}, clone._settings, loader, { loaders: undefined })
        }
        v = clone._run(type, v, runLoaders)
      })
    }

    // todo: check settings loaders
    if (runLoaders && this.settings.loaders) {
      processLoaders(this.settings.loaders, true)
    }

    if (transformer.loaders) {
      processLoaders(transformer.loaders, true)
    }

    const callTransformer = (method, transform, payload) => {
      if (this.settings[method] && typeof this.settings[method] === 'function') {
        const newPayload = this.settings[method].call(this, payload)
        if (transform) {
          payload = newPayload
        }
      }
      return transformer[method] ? transformer[method].call(this, payload) : payload
    }

    if (this.settings.autoCast) {
      v = callTransformer('cast', true, v)
    }

    callTransformer('validate', false, v)
    v = callTransformer('parse', true, v)

    return v
  }

  _parseNested (obj) {
    const resultingObject = {}
    const errors = []
    const sandbox = (fn) => {
      try {
        fn()
      } catch (err) {
        if (err instanceof ValidationError) {
          if (err instanceof ValidationError && err.errors.length > 0) {
            errors.push(...err.errors)
          } else {
            errors.push(err)
          }
        } else {
          errors.push(err)
        }
      }
    }

    sandbox(() => this.structureValidation(obj))

    this.ownPaths.forEach(pathName => {
      const schema = this.schemaAtPath(pathName)
      sandbox(() => {
        const val = schema.parse(typeof obj === 'object' ? obj[schema.name] : undefined)
        if (val !== undefined) {
          Object.assign(resultingObject, { [schema.name]: val })
        }
      })
    })

    if (errors.length > 0) {
      throw new ValidationError(`Data is not valid`, { errors })
    }

    return resultingObject
  }

  throwError (message, { errors, value } = {}) {
    throw new ValidationError(message, { errors, value, field: this })
  }
}

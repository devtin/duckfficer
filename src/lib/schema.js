import { propertiesRestricted } from 'utils/properties-restricted'
import { castArray } from 'utils/cast-array'
import { obj2dot } from 'utils/obj-2-dot'
import { ValidationError } from './validation-error.js'
import { forEach } from 'utils/for-each.js'
import { castThrowable } from 'utils/cast-throwable'
import { Transformers } from './transformers.js'

/**
 * @typedef {Object} Schema~SchemaModel
 * @desc This object defines the desired structure of our schema. It must contain as many properties
 * as fields we want to validate. Each property must be either a {@link Field} or a {@link Schema} for
 * nested objects.
 * @property {SchemaModel} theFieldName - Add as many property schemas as you need in order to build your validation model
 */

/**
 * @typedef {Object} Schema~SchemaSettings
 * @desc This object describes the settings of a schema.
 * @property {String} type - Name of the transformer to use to parse the property.
 * @property {Boolean} autoCast=true - Runs the `autoCast` feature of the Transformer.
 * @property {Boolean} required=true - Whether the property is or not required.
 * @property {Function|*} [default] - Default value when non-passed. Mind this will treat properties as `required=false`.
 * When a function is given, its called using the schema of the property as its `this` object, receiving given value as first argument.
 * Must return the desired default value.
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
   * @param {SchemaModel} schema
   * @param {Object} [options]
   * @param {String} [options.name] - Alternative name of the object
   * @param {Schema} [options.parent]
   */
  constructor (schema, { name, parent } = {}) {
    this.settings = {
      autoCast: true,
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
      this.settings = typeof schema === 'object' ? Object.assign({}, this.settings, { required: schema.default === undefined }, schema) : this.settings
      delete this.settings.type
    }

    if (this.settings.default !== undefined && this.settings.required) {
      throw new Error(`Remove either the 'required' or the 'default' option for property ${ this.fullPath }.`)
    }
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

  _run (type, v) {
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

    if (transformer.loaders) {
      forEach(castArray(transformer.loaders), loader => {
        const type = Schema.guessType(loader)
        v = this._run(type, v)
      })
    }

    const callTransformer = (method, ...payload) => {
      return transformer[method].call(this, ...payload)
    }

    if (this.settings.autoCast && transformer.cast) {
      v = callTransformer('cast', v)
    }

    if (transformer.validate) {
      callTransformer('validate', v)
    }

    if (transformer.parse) {
      v = callTransformer('parse', v)
    }

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

import { propertiesRestricted } from 'utils/properties-restricted'
import { castArray } from 'utils/cast-array'
import { obj2dot } from 'utils/obj-2-dot'
import { ValidationError } from './validation-error.js'
import { forEach } from 'utils/for-each.js'
import { castThrowable } from 'utils/cast-throwable'
import { Transformers } from './transformers.js'

const fnProxyStub = v => v

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
 * @classdesc Orchestrates the validation of a data schema
 * @property {Schema} [parent] - Nested objects will have a {@link Schema} in this property
 * @property {String} name - Nested objects will have the name of it's containing property
 * @property {Schema~SchemaSettings} schema - The schema
 */
export class Schema {
  /**
   * @constructor
   * @description Sets the environment up:
   * - Stores the schema locally
   * - Guesses the type of the schema
   * @param {Schema~TheSchema} schema
   * @param {Object} [options]
   * @param {String} [options.name] - Alternative name of the object
   * @param {Schema} [options.parent]
   * @param {Caster} [options.cast] - Schema caster
   * @param {Object} [options.settings] - Initial settings
   * @param {Validator} [options.validate] - Final validation
   */
  constructor (schema, { name, parent, validate, cast, settings = {} } = {}) {
    this._defaultSettings = {
      required: true,
      default: undefined
    }

    this._settings = settings

    this.schema = schema
    this.parent = parent
    // schema level validation: validates using the entire value (maybe an object) of this path
    this._validate = validate
    // schema level c: validates using the entire value (object) of this path
    this._cast = cast
    this.name = name || ''
    this.originalName = this.name
    this.type = Schema.guessType(schema)
    this.currentType = castArray(this.type)[0]
    this.children = []

    /**
     * @property {String} type - The schema type. Options vary according to available Transformers. Could be 'Schema'
     * for nested objects.
     * @property {Schema[]} [children] - For nested objects
     */

    if (Schema.isNested(schema)) {
      this.children = this._parseSchema(schema)
    } else {
      this._settings = typeof schema === 'object' ? Object.assign({}, this._settings, { required: schema.default === undefined }, schema) : this._settings
      delete this._settings.type
    }

    if (this.settings.default !== undefined && this.settings.required) {
      throw new Error(`Remove either the 'required' or the 'default' option for property ${ this.fullPath }.`)
    }
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
    const settings = Object.assign({}, obj)
    delete settings.type
    return settings
  }

  _parseSchema (obj) {
    return Object.keys(obj).map((prop) => {
      // console.log(`obj[${ prop }]`, /*obj[prop], */Schema.guessType(obj[prop]))
      if (Schema.guessType(obj[prop]) === 'Schema') {
        const schemaClone = Schema.cloneSchema({
          schema: Schema.castSchema(obj[prop]),
          settings: Schema.castSettings(obj[prop]),
          name: prop,
          parent: this
        })
        // schemaClone.name = prop
        // schemaClone.parent = this
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
    return Schema.guessType(obj) === 'Object' && !obj.type
  }

  static guessType (value) {
    if (value instanceof Schema) {
      return 'Schema'
    }

    if (typeof value === 'function') {
      return value.name
    }

    if (typeof value === 'object' && value.type) {
      return Schema.guessType(value.type)
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      return 'Object'
    }

    if (Array.isArray(value)) {
      value = value.map(Schema.guessType)
    }

    return value
  }

  get fullPath () {
    return (this.parent && this.parent.fullPath ? `${ this.parent.fullPath }.` : '') + this.name
  }

  get ownPaths () {
    return this.children.map(({ name }) => name)
  }

  /**
   * @property {String[]} paths - Contains paths
   */
  get paths () {
    const foundPaths = []

    if (this.hasChildren) {
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

  static cloneSchema ({ schema, name, parent, settings = {} }) {
    const clonedSchema = Object.assign(Object.create(Object.getPrototypeOf(schema)), schema, {
      name: name || schema.name,
      parent,
      cloned: true,
      _settings: Object.assign({}, /*parent ? parent._settings : {}, */settings)
    })
    if (clonedSchema.children) {
      clonedSchema.children = clonedSchema.children.map(theSchema => Schema.cloneSchema({
        schema: theSchema,
        parent: clonedSchema
      }))
    }
    return clonedSchema
  }

  /**
   * Finds schema in given path
   * @param {String} pathName - Dot notation path
   * @return {Schema~SchemaSettings}
   */
  schemaAtPath (pathName) {
    const [path, rest] = pathName.split(/\./)
    let schema
    forEach(this.children, possibleSchema => {
      if (possibleSchema.name === path) {
        schema = possibleSchema
        return false
      }
    })

    if (rest) {
      return schema.schemaAtPath(rest)
    }

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
   * @throws {Schema~ValidationError}
   */
  structureValidation (obj) {
    // console.log(`structureValidation`, this.name, this.ownPaths, propertiesRestricted(obj, this.ownPaths), this.type)
    if (!obj || !this.hasChildren) {
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
   * Validates schema structure, casts, validates and parses  hooks of every field in the schema
   * @param {Object} [v] - The object to evaluate
   * @return {Object} The sanitized object
   * @throws {ValidationError} when given object does not meet the schema
   */
  parse (v) {
    if (this.hasChildren) {
      v = this.runChildren(v)
    } else {
      // console.log(this)
      v = this.parseProperty(this.type, v)

      /*
      Value here would be:
      - casted
      - validated
      - parsed
       */
    }

    // perform property-level hooks
    if (!this.parent) {
      // final casting / validation (schema-level)
      v = this.cast.call(this, v)
      this.validate.call(this, v)
    }

    return v
  }

  /**
   *
   * @param {*} v
   * @param {Schema~SchemaSettings[]} loaders
   * @return {*}
   */
  processLoaders (v, loaders) {
    // throw new Error(`uya!`)
    forEach(castArray(loaders), loaderSchema => {
      // console.log({ loaderSchema })
      if (typeof loaderSchema !== 'object') {
        loaderSchema = { type: loaderSchema }
      }

      const type = Schema.guessType(loaderSchema)
      const clone = Object.assign(Object.create(this), this, { type, _cast: undefined, _validate: undefined })

      if (type !== 'Schema') {
        clone._settings = Object.assign({}, clone._settings, loaderSchema, {
          loaders: undefined,
          cast: undefined,
          validate: undefined
        })
      }

      v = clone.parseProperty(type, v)
    })

    return v
  }

  parseProperty (type, v) {
    if (Array.isArray(type)) {
      let parsed = false
      let result
      forEach(type, t => {
        try {
          this.currentType = t
          result = this.parseProperty(t, v)
          parsed = true
          return false
        } catch (err) {
          // shh...
        }
      })
      if (!parsed) {
        this.throwError(`Could not resolve given value type`)
      }
      return result
    }
    const transformer = Transformers[type]

    if (!transformer) {
      this.throwError(`Don't know how to resolve ${ type }`)
    }

    if (this.settings.default !== undefined && v === undefined) {
      v = typeof this.settings.default === 'function' ? this.settings.default.call(this, v) : this.settings.default
    }

    if (v === undefined && !this.settings.required) {
      return
    }

    if (v === undefined && this.settings.required) {
      const [required, error] = castThrowable(this.settings.required, `Property ${ this.fullPath } is required`)
      required && this.throwError(error, { value: v })
    }

    // run user-level loaders (inception transformers)
    if (this.settings.loaders) {
      v = this.processLoaders(v, this.settings.loaders) // infinite loop
    }

    // run transformer-level loaders
    if (transformer.loaders) {
      v = this.processLoaders(v, transformer.loaders)
    }

    // run transformer caster
    if (this.settings.autoCast) {
      v = this.runTransformer({ method: 'cast', transformer, payload: v })
    }

    v = this.runTransformer({ method: 'cast', transformer: this.settings, payload: v })

    // run transformer validator
    this.runTransformer({ method: 'validate', transformer, payload: v })
    this.runTransformer({ method: 'validate', transformer: this.settings, payload: v })

    // run transformer parser
    return this.runTransformer({ method: 'parse', transformer, payload: v })
  }

  runChildren (obj, { method = 'parse' } = {}) {
    if (!this.settings.required && obj === undefined) {
      return
    }
    const resultingObject = {}
    const errors = []

    // error trapper
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
      const schema = this.schemaAtPath(pathName.replace(/\..*$/))
      const input = typeof obj === 'object' && obj !== null ? obj[schema.name] : undefined

      sandbox(() => {
        const val = schema[method](input)
        if (val !== undefined) {
          Object.assign(resultingObject, { [schema.name]: val })
        }
      })
    })

    if (errors.length > 0) {
      throw new ValidationError(`Data is not valid`, { errors })
    }

    return Object.keys(resultingObject).length > 0 ? resultingObject : obj
  }

  /**
   * Runs given method found in transformer
   * @param method
   * @param transformer
   * @param payload
   * @return {*}
   */
  runTransformer ({ method, transformer, payload } = {}) {
    if (!transformer[method]) {
      return payload
    }

    return transformer[method].call(this, payload)
  }

  throwError (message, { errors, value } = {}) {
    throw new ValidationError(message, { errors, value, field: this })
  }
}

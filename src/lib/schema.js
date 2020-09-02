import { propertiesRestricted } from 'utils/properties-restricted'
import { castArray } from 'utils/cast-array'
import { obj2dot } from 'utils/obj-2-dot'
import { ValidationError } from './validation-error.js'
import { MethodError } from './method-error.js'
import { forEach } from 'utils/for-each.js'
import { castThrowable } from 'utils/cast-throwable'
import { Transformers } from './transformers.js'
import { find } from 'utils/find'
import { isNotNullObj } from 'utils/is-not-null-obj'
import { EventEmitter } from 'events'
import { PromiseEach } from 'utils/promise-each'

const fnProxyStub = async v => Promise.resolve(v)

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
export class Schema {
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
  constructor (schema, { name, defaultValues = {}, methods = {}, parent, validate, cast, settings = {} } = {}) {
    this._settings = settings

    if (Array.isArray(schema) && schema.length === 1) {
      schema = schema[0]
    }

    this._methods = methods
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
    this._defaultSettings = {
      required: true,
      allowNull: false,
      default: undefined
    }
    this._defaultValues = defaultValues
    /**
     * @typedef {Object} virtual
     * @property {Function} get
     * @property {Function} set
     */
    this.virtuals = []

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
      throw new Error(`Remove either the 'required' or the 'default' option for property ${this.fullPath}.`)
    }

    this._defaultSettings.default = this.getDefault()
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
    const settings = Object.assign({}, obj)
    delete settings.type
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
      await this.parse(obj)
      return true
    } catch (err) {
      return false
    }
  }

  _parseSchema (obj) {
    return Object.keys(obj).map((prop) => {
      const objDesc = Object.getOwnPropertyDescriptor(obj, prop)

      if (typeof objDesc.get === 'function' || typeof objDesc.set === 'function') {
        this.virtuals.push({
          path: prop,
          getter: objDesc.get,
          setter: objDesc.set
        })
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
    return (this.parent && this.parent.fullPath ? `${this.parent.fullPath}.` : '') + this.name
  }

  get ownPaths () {
    return this.children.map(({ name }) => name)
  }

  /**
   * @property {String[]} paths - Contains paths
   */
  get paths () {
    const foundPaths = []

    this.name && foundPaths.push(this.name)

    if (this.hasChildren) {
      this.children.forEach(({ paths }) => {
        paths.forEach(path => {
          foundPaths.push((this.name ? `${this.name}.` : '') + path)
        })
      })
    }

    return foundPaths
  }

  static cloneSchema ({ schema, name, parent, settings = {}, defaultValues, type, cast, validate, currentType }) {
    const clonedSchema = Object.assign(Object.create(Object.getPrototypeOf(schema)), schema, {
      name: name || schema.name,
      type: type || schema.type,
      currentType: currentType || schema.currentType,
      _cast: (cast || cast === false ? cast : schema._cast),
      _validate: (validate || validate === false ? validate : schema._validate),
      parent,
      cloned: true,
      _defaultValues: defaultValues || schema._defaulValues,
      _settings: Object.assign({}, schema._settings, settings)
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
   * @return {Schema|Schema[]}
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

    const unknownFields = []
    if (!propertiesRestricted(obj, this.ownPaths)) {
      if (obj) {
        obj2dot(obj).forEach(field => {
          if (
            this.hasChildren &&
            !this.hasField(field)
          ) {
            unknownFields.push(new Error(`Unknown property ${this.name ? this.name + '.' : ''}${field}`))
          }
        })
      }
    }

    this.ownPaths.forEach((path) => {
      try {
        this.schemaAtPath(path).structureValidation(obj[path])
      } catch (err) {
        const { errors } = err
        unknownFields.push(...errors)
      }
    })

    if (unknownFields.length > 0) {
      throw new ValidationError('Invalid object schema' + (this.parent ? ` in property ${this.fullPath}` : ''), {
        errors: unknownFields,
        value: obj,
        field: this
      })
    }
  }

  async fullCast (v, { state }) {
    v = await this.cast(v, { state })
    if (typeof v === 'object' && v && this.hasChildren) {
      await PromiseEach(this.children, async child => {
        const parsedValue = await child.fullCast(v[child.name], { state })
        if (parsedValue !== undefined) {
          v[child.name] = await child.fullCast(v[child.name], { state })
        }
      })
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
    v = await this.fullCast(v, { state })

    if (!this.parent) {
      this.structureValidation(v)
    }

    if (this.hasChildren) {
      v = await this.runChildren(v, { state })
    } else {
      // console.log(this)
      v = await this.parseProperty(this.type, v, { state })

      /*
      Value here would be:
      - casted
      - validated
      - parsed
       */
    }

    // schema-level validation
    await this.validate(v, { state })

    // append virtuals
    if (isNotNullObj(v)) {
      this.virtuals.forEach(({ path, getter, setter }) => {
        Object.defineProperties(v, {
          [path]: { get: getter, set: setter, enumerable: virtualsEnumerable }
        })
      })
    }

    // event emitter
    if (isNotNullObj(v) || Array.isArray(v)) {
      const emitter = new EventEmitter()
      Object.defineProperties(v, {
        $on: {
          value: emitter.on.bind(emitter),
          writable: true,
          enumerable: false
        }
      })

      // append methods
      Object.keys(this._methods).forEach(methodName => {
        const inputValidation = this._methods[methodName].input
        const outputValidation = this._methods[methodName].output
        const methodIsEnumerable = this._methods[methodName].enumerable
        const methodEvents = this._methods[methodName].events
        const methodErrors = this._methods[methodName].errors

        const methodFn = async (...arg) => {
          if (inputValidation) {
            try {
              arg = await Schema.ensureSchema(inputValidation).parse(arg.length === 1 ? arg[0] : arg)
            } catch (err) {
              throw new ValidationError(`Invalid input at method ${methodName}`, { errors: err.errors.length > 0 ? err.errors : [err] })
            }
          }

          const thisArg = {
            async $emit (eventName, payload) {
              if (methodEvents) {
                if (!methodEvents[eventName]) {
                  throw new Error(`Unknown event ${eventName}`)
                }

                try {
                  payload = await Schema.ensureSchema(methodEvents[eventName]).parse(payload)
                } catch (err) {
                  throw new ValidationError(`Invalid payload for event ${eventName}`, {
                    errors: err.errors.length > 0 ? err.errors : [err]
                  })
                }
              }
              emitter.emit(eventName, payload)
            },
            async $throw (errorName, payload) {
              if (methodErrors) {
                if (!methodErrors[errorName]) {
                  throw new MethodError(`Unknown error ${errorName}`)
                }

                try {
                  payload = methodErrors[errorName] ? await Schema.ensureSchema(methodErrors[errorName]).parse(payload) : payload
                } catch (err) {
                  throw new ValidationError(`Invalid payload for error ${errorName}`, {
                    errors: err.errors.length > 0 ? err.errors : [err]
                  })
                }
              }
              throw new MethodError(errorName, payload)
            },
            $field: v
          }
          const result = await (this._methods[methodName].handler || this._methods[methodName]).apply(thisArg, Array.isArray(arg) ? arg : [arg])

          if (outputValidation) {
            try {
              return await Schema.ensureSchema(outputValidation).parse(result)
            } catch (err) {
              throw new ValidationError(`Invalid output at method ${methodName}`, { errors: err.errors.length > 0 ? err.errors : [err] })
            }
          }

          return result
        }

        Object.defineProperty(v, methodName, {
          value: methodFn,
          writable: true,
          enumerable: methodIsEnumerable
        })
      })
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
        loaderSchema = { type: loaderSchema }
      }

      const type = Schema.guessType(loaderSchema)
      const clone = Schema.cloneSchema({ schema: this, type, currentType: type, cast: false, validate: false })

      if (type !== 'Schema') {
        clone._settings = Object.assign({}, clone._settings, loaderSchema, {
          loaders: undefined,
          cast: undefined,
          validate: undefined
        })
      }

      v = await clone.parseProperty(type, v, { state })
    })

    return v
  }

  async parseProperty (type, v, { state = {} } = {}) {
    if (v === null && this.settings.allowNull) {
      return v
    }

    if (Array.isArray(type)) {
      let parsed = false
      let result
      await PromiseEach(type, async t => {
        try {
          this.currentType = t
          result = await this.parseProperty(t, v, { state })
          parsed = true
          return false
        } catch (err) {
          // shh...
        }
      }, true)
      if (!parsed) {
        this.throwError(`Could not resolve given value type${this.fullPath ? ' in property ' + this.fullPath : ''}. Allowed types are ${type.slice(0, -1).join(', ') + ' and ' + type.pop()}`, { value: v })
      }
      return result
    }
    const transformer = Transformers[type]

    if (!transformer) {
      this.throwError(`Don't know how to resolve ${type} in property ${this.fullPath}`, { value: v })
    }

    if (this.settings.default !== undefined && v === undefined) {
      v = typeof this.settings.default === 'function' ? await this.settings.default.call(this, { state }) : this.settings.default
    }

    if (v === undefined && !this.settings.required) {
      return
    }

    if (v === undefined && this.settings.required) {
      const [required, error] = castThrowable(this.settings.required, `Property ${this.fullPath} is required`)
      required && this.throwError(error, { value: v })
    }

    // run user-level loaders (inception transformers)
    if (this.settings.loaders) {
      v = await this.processLoaders(v, { loaders: this.settings.loaders, state }) // infinite loop
    }

    // run transformer-level loaders
    if (transformer.loaders) {
      v = await this.processLoaders(v, { loaders: transformer.loaders, state })
    }

    v = await this.runTransformer({ method: 'cast', transformer: this.settings, payload: v, state })

    // run transformer caster
    if (this.settings.autoCast) {
      v = await this.runTransformer({ method: 'cast', transformer, payload: v, state })
    }

    // run transformer validator
    await this.runTransformer({ method: 'validate', transformer, payload: v, state })
    await this.runTransformer({ method: 'validate', transformer: this.settings, payload: v, state })

    // run transformer parser
    return this.runTransformer({ method: 'parse', transformer, payload: v, state })
  }

  async runChildren (obj, { method = 'parse', state = {} } = {}) {
    if (!this.settings.required && obj === undefined) {
      return
    }
    const resultingObject = {}
    const errors = []

    // error trapper
    const sandbox = async (fn) => {
      try {
        await fn()
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

    await PromiseEach(this.ownPaths, async pathName => {
      const schema = this.schemaAtPath(pathName.replace(/\..*$/))
      const input = isNotNullObj(obj) ? obj[schema.name] : undefined

      await sandbox(async () => {
        const val = await schema[method](input, { state })
        if (val !== undefined) {
          Object.assign(resultingObject, { [schema.name]: val })
        }
      })
    })

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

import test from 'ava'
import { Schema, ValidationError, Transformers } from '../../'
import crypto from 'crypto'

test('Creating a schema', async t => {
  /**
   * In order to check the data integrity of an object, a schema defining the expected structure of the desired object
   * needs to be created.
   */

  const UserSchema = new Schema({
    // advanced type definition
    name: {
      // defining the type
      type: String
      // we could add additional settings here
    },
    // short-hand type definition
    birthday: Date, // => { type: Date }
    description: Array
  })

  /**
   * The instance of the created schema has a method called `parse`. We use this method in order to perform structure
   * validation, casting and type-validation of arbitrary objects. The method `parse` receives as the first
   * argument an arbitrary object that will be casted and validated against the defined schema. The parse function will
   * return a newly created schema-compliant object.
   *
   * See the [Schema](/api.md#Schema) class docs for more information.
   */

  t.true(typeof UserSchema.parse === 'function')

  const arbitraryObject = {
    name: 'Martin Rafael',
    birthday: new Date('11/11/1999'),
    description: ['monkey', 'developer', 'arepa lover']
  }

  let safeObject
  t.notThrows(() => {
    safeObject = UserSchema.parse(arbitraryObject)
  })

  t.truthy(safeObject)
  t.deepEqual(safeObject, arbitraryObject)
  t.true(safeObject !== arbitraryObject)

  /**
   * Returned object-properties can now be safely accessed since the object was validated to be schema-compliant.
   */

  t.truthy(safeObject)
  t.is(safeObject.name, 'Martin Rafael')
  t.true(safeObject.birthday instanceof Date)
  t.is(safeObject.birthday.getFullYear(), 1999)
  t.is(safeObject.description.length, 3)
})

test('Validating and sanitizing arbitrary objects', t => {
  /**
   * Using the same `UserSchema` example above:
   */

  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    description: Array
  })

  /**
   * Think of an *arbitrary object* as one coming from an unreliable source, i.e. passed in an http request;
   * or maybe retrieved by a manual input from a terminal application.
   */

  const arbitraryObject = {
    firstName: 'Martin',
    lastName: 'Rafael',
    birthday: '11/11/1999',
    address: {
      zip: 305
    },
    description: ['monkey', 'developer', 'arepa lover']
  }

  /**
   * Above's object `arbitraryObject` contains properties that do not exist in the schema: `firstName`,
   * `middleName` and `lastName`, are not defined in the schema.
   *
   * Following validation will result in an error since the arbitrary object does not match the schema: it contains
   * these 3 unknown properties. The schema validator will first perform a structure validation making sure the payload
   * structure matches the provided schema structure, prior performing any type validation / further logic.
   *
   * Even when the property `name` (expected by the defined schema) is also missing, it won't be reported since the
   * payload's schema structure doest not match the provided one.
   */

  let error = t.throws(() => UserSchema.parse(arbitraryObject))

  t.true(error instanceof ValidationError)
  t.true(error instanceof Error)
  t.is(error.message, 'Invalid object schema')
  t.is(error.errors.length, 3)
  t.is(error.errors[0].message, 'Unknown property firstName')
  t.is(error.errors[1].message, 'Unknown property lastName')
  t.is(error.errors[2].message, 'Unknown property address.zip')

  /**
   * When the payload's structure matches the schema (all of the payload properties are defined in the schema) it will
   * then proceed with further validations...
   */

  error = t.throws(() => UserSchema.parse({
    birthday: '11/11/1999',
    description: ['monkey', 'developer', 'arepa lover']
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Property name is required')

  /**
   * A custom `state` can be passed to extend the validation process.
   */

  const AnotherUserSchema = new Schema({
    name: String,
    email: {
      type: String,
      required: false
    },
    level: {
      type: String,
      validate (v, { state }) {
        if (v === 'admin' && !state?.user) {
          this.throwError('Only authenticated users can set the level to admin')
        }
      }
    }
  }, {
    validate (v, { state }) {
      if (state.user.level !== 'root' && v.level === 'admin' && !v.email) {
        this.throwError('Admin users require an email')
      }
    }
  })

  error = t.throws(() => AnotherUserSchema.parse({
    name: 'Martin Rafael',
    level: 'admin'
  }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Only authenticated users can set the level to admin')
  t.is(error.errors[0].field.fullPath, 'level')

  error = t.throws(() => AnotherUserSchema.parse({
    name: 'Martin Rafael',
    level: 'admin'
  }, {
    state: {
      user: {
        name: 'system',
        level: 'admin'
      }
    }
  }))

  t.is(error.message, 'Admin users require an email')

  t.notThrows(() => {
    return AnotherUserSchema.parse({
      name: 'Martin Rafael',
      level: 'admin'
    }, {
      state: {
        user: {
          name: 'system',
          level: 'root'
        }
      }
    })
  })
})

test('Error-handling and LifeCycle', t => {
  /**
   * Below we are gonna dive into the schema-validation life-cycle for a better understanding of the tool.
   */

  const lifeCycle = []

  let arbitraryObject
  const passedState = { someStateProp: true }
  let error

  const hook = ({ levelName, hookName }) => {
    return function (value, { state }) {
      t.is(state, passedState)

      let label = `${levelName}-level`

      if (this.fullPath) {
        label = `->${this.fullPath}(${label})`
      }

      lifeCycle.push(`${label} ${hookName} hook`)
      return value
    }
  }

  const cast = hook({ levelName: 'property', hookName: 'cast' })
  const validate = hook({ levelName: 'property', hookName: 'validate' })

  /**
   * The schema below will trace most of the library's flow life-cycle.
   */

  const UserSchema = new Schema({
    name: {
      type: String,
      // property-level cast hook (optional)
      cast,
      // property-level validation hook (optional)
      validate
    },
    birthday: {
      type: 'Birthday',
      cast,
      validate
    },
    phoneNumber: {
      type: Number,
      cast,
      validate
    }
  }, {
    // schema-level cast hook (optional)
    cast: hook({ levelName: 'schema', hookName: 'cast' }),
    // schema-level validate hook (optional)
    validate: hook({ levelName: 'schema', hookName: 'validate' })
  })

  arbitraryObject = {
    somePropertyNotDefinedInTheSchema: ':)',
    birthday: '11/11/1999',
    phoneNumber: '123'
  }

  error = t.throws(() => UserSchema.parse(arbitraryObject, { state: passedState }))

  t.is(error.message, 'Invalid object schema')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Unknown property somePropertyNotDefinedInTheSchema')

  /**
   * Throws an error when the given `arbitraryObject` structure does not comply with the given schema structure.
   */

  t.is(error.errors[0].message, 'Unknown property somePropertyNotDefinedInTheSchema')
  t.is(error.errors[0].field, undefined) // the field does not exists in our schema

  lifeCycle.length = 0

  /**
   * Throws an error when missing required values.
   */

  error = t.throws(() => UserSchema.parse({
    // name: 'Martin',
    birthday: '11/11/1999',
    phoneNumber: '123'
  }, { state: passedState }))

  t.is(error.errors[0].message, 'Property name is required')
  t.is(error.errors[0].field.fullPath, 'name')

  /**
   * Throws an error if defined type is not registered.
   */

  t.is(error.errors[1].message, 'Don\'t know how to resolve Birthday in property birthday')
  t.is(error.errors[1].field.fullPath, 'birthday')

  /**
   * Also throws an error when types don't match.
   */

  t.is(error.errors[2].message, 'Invalid number')
  t.is(error.errors[2].field.fullPath, 'phoneNumber')

  t.deepEqual(lifeCycle, [
    'schema-level cast hook',
    '->phoneNumber(property-level) cast hook'
  ])

  /**
   * Let's register a transformer named Birthday and try again with valid data!
   */

  Transformers.Birthday = {
    settings: {
      autoCast: true
    },
    loaders: [{ type: Date, autoCast: true }],
    // will trace all of the type-level hooks!
    cast: hook({ levelName: 'type', hookName: 'cast' }),
    validate: hook({ levelName: 'type', hookName: 'validate' }),
    parse: hook({ levelName: 'type', hookName: 'parse' })
  }

  arbitraryObject = {
    name: 'Martin',
    birthday: '11/11/1999',
    phoneNumber: 123
  }

  // resetting lifecycle trace
  lifeCycle.length = 0

  t.notThrows(() => UserSchema.parse(arbitraryObject, { state: passedState }))

  /**
   * Below we can clearly see the life-cycle of the validation process.
   */

  t.deepEqual(lifeCycle, [
    'schema-level cast hook',
    '->name(property-level) cast hook',
    '->name(property-level) validate hook',
    '->birthday(property-level) cast hook',
    '->birthday(type-level) cast hook',
    '->birthday(type-level) validate hook',
    '->birthday(property-level) validate hook',
    '->birthday(type-level) parse hook',
    '->phoneNumber(property-level) cast hook',
    '->phoneNumber(property-level) validate hook',
    'schema-level validate hook'
  ])
})

test('Required and optional values', t => {
  /**
   * All properties in a Schema are required by default.
   */
  const AddressSchema = new Schema({
    line1: String,
    line2: String,
    zip: Number
  })

  /**
     * Whenever a required property is missing, an error is thrown.
     */

  let error = t.throws(() => AddressSchema.parse({
    line1: 'Brickell',
    line2: 'Ave'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Property zip is required')

  /**
     * In order to make a property optional we must pass the flag `required` set to `false`
     */

  const ContactSchemaO = new Schema({
    name: String,
    email: String,
    age: {
      type: Number,
      required: false // property `age` is optional
    },
    address: {
      type: AddressSchema,
      required: false
    }
  })
  const ContactSchema = Schema.cloneSchema({ schema: ContactSchemaO })

  /**
     * Arbitrary objects can now be validated missing the property `age` as long as they match the rest of the schema.
     */

  t.notThrows(() => {
    ContactSchema.parse({
      name: 'Martin',
      email: 'tin@devtin.io'
    })
  })

  t.notThrows(() => {
    ContactSchema.parse({
      name: 'Martin',
      email: 'tin@devtin.io',
      age: undefined,
      address: undefined
    })
  })

  /**
     * Whenever `age` is present, the validation will ensure it is a `Number`, though.
     */

  error = t.throws(() => {
    ContactSchema.parse({
      name: 'Papo',
      email: 'sandy@papo.com',
      age: 'I don\'t know.'
    })
  })

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid number')
  t.is(error.errors[0].field.fullPath, 'age')

  let contact2

  t.notThrows(() => {
    contact2 = ContactSchema.parse({
      name: 'Papo',
      email: 'sandy@papo.com',
      age: 36
    })
  })

  t.deepEqual(contact2, {
    name: 'Papo',
    email: 'sandy@papo.com',
    age: 36
  })
})

test('Default values', t => {
  /**
   * Default values are meant to be used whenever an arbitrary object misses the value of the property in subject.
   */

  const ContactSchema = new Schema({
    name: String,
    country: {
      type: String,
      default: 'United States'
    }
  })

  /**
   * When a property is assigned with a `default` value, it is implicitly treated as an optional property (`required`
   * equaled to `false`). See [Required and optional values](#required-and-optional-values) for more information.
   */

  const error = t.throws(() => new Schema({
    name: String,
    state: {
      type: String,
      required: true,
      default: 'Florida'
    }
  }))

  t.is(error.message, 'Remove either the \'required\' or the \'default\' option for property state.')

  let sanitized
  t.notThrows(() => {
    sanitized = ContactSchema.parse({
      name: 'Martin'
    })
  })

  t.deepEqual(sanitized, {
    name: 'Martin',
    country: 'United States'
  })

  /**
   * A default value could also be a function. Refer to the [SchemaSettings](/api.md#schemaschemasettings--object) docs
   * for more information. The function will receive a object with optionally the state passed during parse.
   */

  const UserSchema = new Schema({
    name: String,
    registered: {
      type: Date,
      default: Date.now
    }
  })

  let Martin
  t.notThrows(() => {
    Martin = UserSchema.parse({
      name: 'Martin'
    })
  })

  t.deepEqual(Object.keys(Martin), ['name', 'registered'])
  t.true(Martin.registered instanceof Date)

  /**
   * Another useful way of passing default values is on the schema level using the option `defaultValues`.
   */

  const defaultValues = {
    address: {
      state: 'Florida',
      zip: 33129
    },
    subscribe: true
  }
  const SomeSchema = new Schema({
    name: String,
    address: {
      state: String,
      zip: Number,
      street: String
    },
    phoneNumber: Number,
    subscribe: Boolean
  }, { defaultValues })

  const parsed = SomeSchema.parse({
    name: 'Martin',
    address: {
      street: 'Brickell ave'
    },
    phoneNumber: 3051234567
  })

  t.is(parsed.address.state, 'Florida')
  t.is(parsed.address.zip, 33129)
  t.is(parsed.subscribe, true)
})

test('Null values', t => {
  /**
   * Sometimes it is useful to allow a property to accept null values no matter what type it has.
   * Property-setting `allowNull` allows you to do so.
   */
  const RegularSchema = new Schema({
    type: String
  })
  const error = t.throws(() => RegularSchema.parse(null))
  t.is(error.message, 'Invalid string')

  const NullSchema = new Schema({
    type: String,
    // allowing null values!
    allowNull: true
  })
  t.is(NullSchema.parse(null), null)
})

test('Nesting schemas', t => {
  /**
   * We can use a previously defined schema in order to extend the validation of other schemas.
   */
  const AddressSchema = new Schema({
    line1: String,
    line2: {
      type: String,
      required: false
    },
    zip: {
      type: Number,
      required: false
    }
  }, {
    name: 'AddressSchema',
    settings: {
      required: false
    }
  })

  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    // using an already defined schema in another schema's property
    address: AddressSchema
  })

  const user = UserSchema.parse({
    name: 'Martin',
    birthday: '11/11/1999'
  })

  t.truthy(user)

  const error1 = t.throws(() => UserSchema.parse({
    name: 'Martin',
    birthday: '11/11/1999',
    address: null
  }))

  t.is(error1.errors[0].message, 'Property address.line1 is required')
  t.is(error1.errors[0].field.fullPath, 'address.line1')

  const error2 = t.throws(() => UserSchema.parse({
    name: 'Martin',
    birthday: '11/11/1999',
    address: {
      zip: 33129
    }
  }))

  t.is(error2.errors[0].message, 'Property address.line1 is required')
  t.is(error2.errors[0].field.fullPath, 'address.line1')

  t.deepEqual(UserSchema.paths, ['name', 'birthday', 'address', 'address.line1', 'address.line2', 'address.zip'])

  t.notThrows(() => UserSchema.parse({
    name: 'Martin',
    birthday: '11/11/1999',
    address: {
      line1: 'Brickell Ave',
      zip: 33129
    }
  }))
})

test('Multiple types', t => {
  let error
  const FnSchema = new Schema([Function, Promise])

  t.notThrows(() => FnSchema.parse(() => {}))
  t.notThrows(() => FnSchema.parse(new Promise(resolve => resolve('this'))))

  error = t.throws(() => FnSchema.parse('some pic'))
  t.is(error.message, 'Could not resolve given value type. Allowed types are Function and Promise')

  const UserSchema = new Schema({
    name: String,
    age: [String, Number]
  })

  const martin = UserSchema.parse({
    name: 'Martin',
    age: '12'
  })

  t.is(martin.age, '12')

  const olivia = UserSchema.parse({
    name: 'Olivia',
    age: 0.9
  })

  t.is(olivia.age, 0.9)

  error = t.throws(() => UserSchema.parse({
    name: 'Ana',
    age: new Date('6/18/2020')
  }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Could not resolve given value type in property age. Allowed types are String and Number')
})

test('Auto-casting', t => {
  /**
   * Most transformers provide an option for auto-casting. When property-setting `autoCast` equals `true`
   * (depending on the transformer) it may try to resolve given arbitrary value into the expected one.
   *
   * For example, the [Date](#date) transformer will try to cast values given as `String`'s into a proper `Date`, if possible.
   * The [Number](#number) transformer as well: will try to resolve those `String`'s that look like a number and convert them into
   * a proper `Number`.
   */

  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    kids: {
      type: Number,
      autoCast: true
    }
  })

  let Olivia

  t.notThrows(() => {
    Olivia = UserSchema.parse({
      name: 'Olivia',
      birthday: '8/31/2019',
      kids: '0'
    })
  })

  t.true(Olivia.birthday instanceof Date)
  t.is(typeof Olivia.kids, 'number')

  /**
   * **Turning off auto-casting**
   *
   * Now, when a strict validation is required, this feature can be turned off.
   */

  const StrictUserSchema = new Schema({
    name: String,
    birthday: {
      type: Date,
      autoCast: false
    },
    kids: {
      type: Number,
      autoCast: false
    }
  })

  const error = t.throws(() => StrictUserSchema.parse({
    name: 'Martin',
    birthday: '11/11/1999',
    kids: '1'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 2)
  t.is(error.errors[0].message, 'Invalid date')
  t.is(error.errors[0].field.fullPath, 'birthday')
  t.is(error.errors[1].message, 'Invalid number')
  t.is(error.errors[1].field.fullPath, 'kids')
})

test('Virtuals (getters / setters)', t => {
  const Address = new Schema({
    line1: String,
    line2: String,
    zip: Number,
    get fullAddress () {
      return `${this.line1} / ${this.line2} / ${this.zip}`
    }
  })

  const User = new Schema({
    firstName: String,
    lastName: String,
    get fullName () {
      return this.firstName + ' ' + this.lastName
    },
    set fullName (v) {
      const [firstName, lastName] = v.split(/\s+/)
      this.firstName = firstName
      this.lastName = lastName
    },
    address: {
      type: Address,
      required: false
    }
  })

  const me = User.parse({
    firstName: 'Martin',
    lastName: 'Rafael',
    address: {
      line1: 'Brickell',
      line2: 'Ave',
      zip: 33129
    }
  })

  t.is(me.fullName, 'Martin Rafael')
  t.is(me.address.fullAddress, 'Brickell / Ave / 33129')

  me.fullName = 'Pedro Perez'

  t.is(me.firstName, 'Pedro')
  t.is(me.lastName, 'Perez')

  const error = t.throws(() => {
    me.address.fullAddress = '123'
  })

  t.is(error.message, 'Cannot set property fullAddress of #<Object> which has only a getter')

  const she = User.parse({
    firstName: 'Olivia',
    lastName: 'Isabel'
  })

  t.false(Object.hasOwnProperty.call(she, 'address'))
})

test('Methods & Events', t => {
  /**
   * Methods are applied to the returned data-model. When triggered, they are called using a
   * [this keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) object that contains
   * two properties: `$emit` being a function to emit events and `$field` which is the actual validated value.
   *
   * Below we are gonna illustrate the use of methods and events. To do so, we are gonna use an example where we have
   * `User` model that is meant to validate and log user authentication.
   */

  Transformers.Password = {
    loaders: [String],
    parse (v) {
      return crypto.createHash('sha256')
        .update(v)
        .digest('hex')
    }
  }

  /**
   * In the `Logs` schema below, we are gonna add a method called `addLog`. This method takes a `String` as
   * argument and is only meant to trigger a `newLog` event with a payload matching the schema specified.
   */

  const Logs = new Schema({
    type: Array,
    default () {
      return []
    }
  }, {
    methods: {
      addLog: {
        events: {
          newLog: {
            date: Date,
            message: String
          }
        },
        // this is the schema expected at the handler payload (undefined to accept anything)
        input: String,
        // output: 'SomeSchema', // the schema expected at the handler output (undefined to accept anything)
        handler (message) {
          const newLog = { date: new Date(), message }
          this.$field.push(newLog)
          this.$emit('newLog', newLog)
        }
      }
    }
  })

  /**
   * In the `User` schema below, we are adding a method called `isValidPassword which will check whether given password
   * matched the one provided in the model or not. This method expects a `String` as a argument, can dispatch a
   * `passwordValidated` event and is meant to return a `Boolean`.
   */

  const User = new Schema({
    email: String,
    password: 'Password',
    logs: Logs
  }, {
    methods: {
      isValidPassword: {
        events: {
          passwordValidated: String
        },
        input: String,
        // this is the schema expected at the handler output
        output: Boolean,
        handler (givenPassword) {
          if (givenPassword === 'not-boolean') {
            // will raise an error since the output is meant to be boolean
            return '1'
          }

          const succeed = Transformers.Password.parse(givenPassword) === this.$field.password
          this.$field.logs.addLog(`validation attempt ${succeed ? 'succeed' : 'failed'}`)

          if (givenPassword === 'undefined-event') {
            // will raise an error since 'undefined-event' is not a registered event
            this.$emit('undefined-event')
          }

          if (givenPassword === 'invalid-event-payload') {
            // will raise an error since 'passwordValidated' expects a String payload
            this.$emit('passwordValidated', 1)
          }

          if (succeed) {
            this.$emit('passwordValidated', givenPassword)
          }

          return succeed
        }
      }
    }
  })

  const me = User.parse({
    email: 'tin@devtin.io',
    password: '123'
  })

  const logsReceived = []

  me.logs.$on('newLog', (log) => {
    logsReceived.push(log)
  })

  t.truthy(me.password)
  t.not(me.password, '123')
  t.false(me.isValidPassword('456'))
  t.true(me.isValidPassword('123'))

  t.is(me.logs.length, 2)
  t.is(me.logs[0].message, 'validation attempt failed')
  t.is(me.logs[1].message, 'validation attempt succeed')

  t.deepEqual(logsReceived, me.logs)

  let error

  error = t.throws(() => me.logs.addLog(123))

  t.is(error.message, 'Invalid input at method addLog')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid string')

  error = t.throws(() => me.isValidPassword('not-boolean'))

  t.is(error.message, 'Invalid output at method isValidPassword')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid boolean')

  error = t.throws(() => me.isValidPassword('undefined-event'))
  t.is(error.message, 'Unknown event undefined-event')

  error = t.throws(() => me.isValidPassword('invalid-event-payload'))
  t.is(error.message, 'Invalid payload for event passwordValidated')
  t.is(error.errors[0].message, 'Invalid string')

  t.notThrows(() => User.parse(me))
})

test('Loaders', t => {
  /**
   * Loaders can be seen as a way of piping transformers.
   */

  const User = new Schema({
    id: {
      type: String,
      loaders: [Number],
      cast (aNumber) {
        return `#${aNumber}`
      }
    },
    name: String
  })

  const error = t.throws(() => User.parse({
    id: '123',
    name: 'Kombucha'
  }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid number')

  let product
  t.notThrows(() => {
    product = User.parse({
      id: 123,
      name: 'Kombucha'
    })
  })
  t.truthy(product)
  t.is(product.id, '#123')
})

test('Overriding initial settings', t => {
  const SomeSchema = new Schema({
    name: String
  })

  const error1 = t.throws(() => SomeSchema.parse(undefined))
  t.is(error1.message, 'Data is not valid')
  t.is(error1.errors[0].message, 'Property name is required')

  /**
   * We can override the initial settings of our schema
   */

  const SomeOptionalSchema = new Schema({
    name: String
  },
  {
    settings: {
      required: false
    }
  })

  t.notThrows(() => SomeOptionalSchema.parse(undefined))
  const error2 = t.throws(() => SomeOptionalSchema.parse({}))
  t.is(error2.message, 'Data is not valid')
  t.is(error2.errors[0].message, 'Property name is required')
})

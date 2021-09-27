import test from 'ava'
import { Schema, Transformers } from '../../'

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
  await t.notThrowsAsync(async () => {
    safeObject = await UserSchema.parse(arbitraryObject)
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

test('Error-handling and LifeCycle', async t => {
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
    validate: hook({ levelName: 'schema', hookName: 'validate' }),
    // do not remove unknown properties
    stripUnknown: false
  })

  arbitraryObject = {
    somePropertyNotDefinedInTheSchema: ':)',
    birthday: '11/11/1999',
    phoneNumber: '123'
  }

  error = await t.throwsAsync(() => UserSchema.parse(arbitraryObject, { state: passedState }))

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

  error = await t.throwsAsync(() => UserSchema.parse({
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
    '->name(property-level) cast hook',
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

  await t.notThrowsAsync(() => UserSchema.parse(arbitraryObject, { state: passedState }))

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

test('Required and optional values', async t => {
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

  let error = await t.throwsAsync(() => AddressSchema.parse({
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

  await t.notThrowsAsync(() =>
    ContactSchema.parse({
      name: 'Martin',
      email: 'tin@devtin.io'
    })
  )

  await t.notThrowsAsync(() =>
    ContactSchema.parse({
      name: 'Martin',
      email: 'tin@devtin.io',
      age: undefined,
      address: undefined
    })
  )

  /**
   * Whenever `age` is present, the validation will ensure it is a `Number`, though.
   */

  error = await t.throwsAsync(() =>
    ContactSchema.parse({
      name: 'Papo',
      email: 'sandy@papo.com',
      age: 'I don\'t know.'
    })
  )

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid number')
  t.is(error.errors[0].field.fullPath, 'age')

  let contact2

  await t.notThrowsAsync(async () => {
    contact2 = await ContactSchema.parse({
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

test('Default values', async t => {
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

  await t.notThrowsAsync(async () => {
    sanitized = await ContactSchema.parse({
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
  await t.notThrowsAsync(async () => {
    Martin = await UserSchema.parse({
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
      zip: 305
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

  const parsed = await SomeSchema.parse({
    name: 'Martin',
    address: {
      street: 'Brickell ave'
    },
    phoneNumber: 3051234567
  })

  t.is(parsed.address.state, 'Florida')
  t.is(parsed.address.zip, 305)
  t.is(parsed.subscribe, true)
})

test('Null values', async t => {
  /**
   * Sometimes it is useful to allow a property to accept null values no matter what type it has.
   * Property-setting `allowNull` allows you to do so.
   */
  const RegularSchema = new Schema({
    type: String
  })
  const error = await t.throwsAsync(() => RegularSchema.parse(null))
  t.is(error.message, 'Invalid string')

  const NullSchema = new Schema({
    type: String,
    // allowing null values!
    allowNull: true
  })
  t.is(await NullSchema.parse(null), null)
})

test('Nesting schemas', async t => {
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

  const user = await UserSchema.parse({
    name: 'Martin',
    birthday: '11/11/1999'
  })

  t.truthy(user)

  const error1 = await t.throwsAsync(() => UserSchema.parse({
    name: 'Martin',
    birthday: '11/11/1999',
    address: null
  }))

  t.is(error1.errors[0].message, 'Property address.line1 is required')
  t.is(error1.errors[0].field.fullPath, 'address.line1')

  const error2 = await t.throwsAsync(() => UserSchema.parse({
    name: 'Martin',
    birthday: '11/11/1999',
    address: {
      zip: 305
    }
  }))

  t.is(error2.errors[0].message, 'Property address.line1 is required')
  t.is(error2.errors[0].field.fullPath, 'address.line1')

  t.deepEqual(UserSchema.paths, ['name', 'birthday', 'address', 'address.line1', 'address.line2', 'address.zip'])

  await t.notThrowsAsync(() => UserSchema.parse({
    name: 'Martin',
    birthday: '11/11/1999',
    address: {
      line1: 'Brickell Ave',
      zip: 305
    }
  }))
})

test('Multiple types', async t => {
  let error
  const FnSchema = new Schema([Function, Object])

  await t.notThrowsAsync(() => FnSchema.parse(() => {}))
  await t.notThrowsAsync(() => FnSchema.parse(new Promise(resolve => {
    resolve({ obj: 'some-obj' })
  })))

  error = await t.throwsAsync(() => FnSchema.parse('some pic'))
  t.is(error.message, 'Could not resolve given value type. Allowed types are Function and Object')

  const UserSchema = new Schema({
    name: String,
    age: [String, Number, Date]
  })

  const martin = await UserSchema.parse({
    name: 'Martin',
    age: '12'
  })

  t.is(martin.age, '12')

  const olivia = await UserSchema.parse({
    name: 'Olivia',
    age: 0.9
  })

  t.is(olivia.age, 0.9)

  const juana = await UserSchema.parse({
    name: 'Olivia',
    age: new Date('01/01/1990')
  })

  t.true(juana.age instanceof Date)

  error = await t.throwsAsync(() => UserSchema.parse({
    name: 'Ana',
    age: new Set(['status a', 'status b'])
  }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Could not resolve given value type in property age. Allowed types are String, Number and Date')
})

test('Auto-casting', async t => {
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

  await t.notThrowsAsync(async () => {
    Olivia = await UserSchema.parse({
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

  const error = await t.throwsAsync(() => StrictUserSchema.parse({
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

test('Loaders', async t => {
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

  const error = await t.throwsAsync(() => User.parse({
    id: '123',
    name: 'Kombucha'
  }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid number')

  let product
  await t.notThrowsAsync(async () => {
    product = await User.parse({
      id: 123,
      name: 'Kombucha'
    })
  })
  t.truthy(product)
  t.is(product.id, '#123')
})

test('Overriding initial settings', async t => {
  const SomeSchema = new Schema({
    name: String
  })

  const error1 = await t.throwsAsync(() => SomeSchema.parse(undefined))
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

  await t.notThrowsAsync(() => SomeOptionalSchema.parse(undefined))
  const error2 = await t.throwsAsync(() => SomeOptionalSchema.parse({}))
  t.is(error2.message, 'Data is not valid')
  t.is(error2.errors[0].message, 'Property name is required')
})

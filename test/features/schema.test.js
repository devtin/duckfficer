import test from 'ava'
import { Schema, ValidationError } from '../../'

test(`Creating a schema`, async t => {
  /**
   * In order to check the data integrity of an object, a schema is created defining the expected
   * structure of the desired object.
   */

  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    description: Array
  })

  /**
   * The created schema has a method called `parse`. This method is used to
   * (optionally) cast, validate and parse arbitrary objects, returning a newly created schema-compliant object. See the
   * [Schema](/DOCS.md#Schema) class docs for more information.
   */

  t.true(typeof UserSchema.parse === 'function')

  const arbitraryObject = {
    name: `Martin Rafael Gonzalez`,
    birthday: new Date('6/11/1983'),
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
   * Returned object-properties can now be accessed safely since the object was validated to be schema-compliant.
   */

  t.truthy(safeObject)
  t.is(safeObject.name, `Martin Rafael Gonzalez`)
  t.true(safeObject.birthday instanceof Date)
  t.is(safeObject.birthday.getFullYear(), 1983)
  t.is(safeObject.description.length, 3)
})

test(`Validating arbitrary objects`, t => {
  /**
   * Using the same `UserSchema` example above:
   */

  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    description: Array
  })

  /**
   * Think of an *arbitrary object* as one coming from an unreliable source, i.e. retrieved through a POST request;
   * or maybe retrieved by a manual input from a terminal application.
   */

  const arbitraryObject = {
    firstName: 'Martin',
    middleName: 'Rafael',
    lastName: 'Gonzalez',
    birthday: `6/11/1983`,
    description: ['monkey', 'developer', 'arepa lover']
  }

  /**
   * Above's object `arbitraryObject` contains properties that do not exist in the schema: `firstName`,
   * `middleName` and `lastName`, are not defined in the schema.
   *
   * Following validation will result in an error since the arbitrary object does not match the schema: it contains
   * these 3 unknown properties, plus the property `name` (expected by the defined schema) is also missing.
   */

  const error = t.throws(() => UserSchema.parse(arbitraryObject))

  t.true(error instanceof ValidationError)
  t.true(error instanceof Error)
  t.is(error.message, `Data is not valid`)
  t.is(error.errors.length, 4)
  t.is(error.errors[0].message, `Unknown property firstName`)
  t.is(error.errors[1].message, `Unknown property middleName`)
  t.is(error.errors[2].message, `Unknown property lastName`)
  t.is(error.errors[3].message, `Property name is required`)
})

test(`Required properties`, t => {
  /**
   * A schema defines the structure and data-type expected by an arbitrary object.
   * All properties are required by default.
   */
  const ProductSchema = new Schema({
    name: String,
    stock: Number,
    category: Array
  })

  /**
   * Whenever a required property is missing, an error is thrown.
   */

  let error = t.throws(() => ProductSchema.parse({
    name: 'Kombucha',
    stock: 11
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, `Property category is required`)
})

test(`Optional properties`, t => {
  /**
   * A schema is created below with an optional-property named `age`.
   * The property-setting `required` set to `false` is what enables this feature.
   */

  const ContactSchema = new Schema({
    name: String,
    email: String,
    age: {
      type: Number,
      required: false // property `age` is optional
    }
  })

  /**
   * Arbitrary objects can now be validated missing the property `age` as long as they match the rest of the schema.
   */

  let contact
  t.notThrows(() => {
    contact = ContactSchema.parse({
      name: 'Martin',
      email: 'tin@devtin.io'
    })
  })

  /**
   * Whenever `age` is present, the validation will ensure it is a `Number`, though.
   */

  let contact2
  const error = t.throws(() => {
    contact2 = ContactSchema.parse({
      name: 'Papo',
      email: 'sandy@papo.com',
      age: `I don't know.`
    })
  })

  t.is(error.message, `Data is not valid`)
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, `Invalid number`)
  t.is(error.errors[0].field.fullPath, `age`)

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

test(`Default values`, t => {
  /**
   * Default values are meant to be used when an arbitrary object misses the value of the property in subject.
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
   * equaled to `false`). See [optional properties](#optional-properties) for more information.
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
   * A default value could also be a function. Refer to the [SchemaSettings](/DOCS.md#schemaschemasettings--object) docs
   * for more information.
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
})

test(`Auto-casting`, t => {
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
    birthday: '6/11/1983',
    kids: '1'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 2)
  t.is(error.errors[0].message, `Invalid date`)
  t.is(error.errors[0].field.fullPath, `birthday`)
  t.is(error.errors[1].message, `Invalid number`)
  t.is(error.errors[1].field.fullPath, `kids`)
})

test(`Nesting schemas`, t => {
  /**
   * We can use a previously defined schema in order to extend the validation of other schemas.
   */
  const AddressSchema = new Schema({
    line1: String,
    line2: {
      type: String,
      required: false,
    },
    zip: {
      type: Number,
      required: false
    }
  }, {
    name: 'AddressSchema'
  })

  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    // using an already defined schema in another schema's property
    address: {
      type: AddressSchema,
      required: false
    }
  })

  const user = UserSchema.parse({
    name: 'Martin',
    birthday: '6/11/1983'
  })

  t.truthy(user)

  const error = t.throws(() => UserSchema.parse({
    name: 'Martin',
    birthday: '6/11/1983',
    address: {
      zip: 33129
    }
  }))

  t.is(error.errors[0].message, 'Property address.line1 is required')
  t.is(error.errors[0].field.fullPath, 'address.line1')

  t.notThrows(() => UserSchema.parse({
    name: 'Martin',
    birthday: '6/11/1983',
    address: {
      line1: 'Brickell Ave',
      zip: 33129
    }
  }))
})

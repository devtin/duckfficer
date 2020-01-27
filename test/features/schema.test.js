import test from 'ava'
import { Schema, ValidationError } from '../../'

test(`Creating a schema`, async t => {
  /**
   * In order to check the data integrity of an object, I'm gonna create a schema defining the expected
   * structure of my desired object.
   */

  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    description: Array
  })

  /**
   * My created schema is ready to parse arbitrary objects.
   */

  const arbitraryObject = {
    name: `Martin Rafael Gonzalez`,
    birthday: '6/11/1983',
    description: ['monkey', 'developer', 'arepa lover']
  }

  const Martin = UserSchema.parse(arbitraryObject)

  /**
   * I can now use the returned sanitized-object carelessly since I just ensured it will match my expected schema.
   */

  t.is(Martin.name, `Martin Rafael Gonzalez`)
  t.true(Martin.birthday instanceof Date)
  t.is(Martin.birthday.getFullYear(), 1983)
  t.is(Martin.description.length, 3)
})

test(`Validating arbitrary objects`, t => {
  /**
   * I'll continue using the `UserSchema` example to validate arbitrary objects.
   */

  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    description: Array
  })

  /**
   * Think of an *arbitrary object* as one that could have been inputted and send through an HTML form,
   * retrieved from a POST request; or maybe inputted from a terminal application. An error will be thrown given an
   * arbitrary object not matching the defined schema.
   */

  const arbitraryObject = {
    firstName: 'Martin',
    middleName: 'Rafael',
    lastName: 'Gonzalez',
    birthday: `6/11/1983`,
    description: ['monkey', 'developer', 'arepa lover']
  }

  /**
   * Given object contains fields that does not exists in our schema (`firstName`, `middleName` and `lastName`),
   * following validation will result in an error since the arbitrary object contains 3 unknown properties, plus the
   * property `name` (expected by the schema) is also missing.
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
   * Whenever a required property is missing, an error will be thrown.
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
   * In the example below I'm gonna create a schema with an optional property called `age`.
   * In order to do so I'm gonna set the property setting `required` to `false`.
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
   * I can now validate arbitrary objects missing the property `age` as long as they match other required properties.
   */

  let contact
  t.notThrows(() => {
    contact = ContactSchema.parse({
      name: 'Martin',
      email: 'tin@devtin.io'
    })
  })

  /**
   * Whenever `age` is present, the validation will ensure it is a `Number`.
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
   * Default values are meant to be assigned to a property when absent.
   */

  const ContactSchema = new Schema({
    name: String,
    country: {
      type: String,
      default: 'United States'
    }
  })

  /**
   * When a property is assigned with a default value, it will be treated as `{ required: false }`.
   */

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
   * A default value could also be a function. Refer to the [docs](DOCS.md) for more information.
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
   * Most transformers provide an option for auto-casting. When `autoCast=true` (depending on the transformer) it may
   * try to resolve given arbitrary value into the expected one.
   *
   * For example, the `Date` transformer will try to auto-cast `String`'s into a proper `Date`, if possible.
   * The `Number` transformer as well: will try to resolve those `String`'s that look like a number and convert them into
   * a proper `Number.
   */

  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    kids: Number
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
   * Now, depending on how strictly we need to perform our validations, sometimes we may require to turn this
   * feature off.
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

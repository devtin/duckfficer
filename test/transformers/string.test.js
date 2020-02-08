import test from 'ava'
import { Schema } from '../../'

test(`String`, t => {
  /**
   * Validates `String`'s.
   */
  const stringSchema = new Schema({
    name: String
  })

  const error = t.throws(() => stringSchema.parse({ name: 123 }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid string')
  t.is(error.errors[0].field.fullPath, 'name')
})

test(`autoCast (default \`false\`)`, async t => {
  /**
   * String transformer would call the method `toString` of any given object when `autoCast` equals `true` and would assign
   * returned value as long as it is different than `[object Object]`
   */
  const nameSchema = new Schema({
    name: {
      type: String,
      autoCast: true
    }
  })

  const user = nameSchema.parse({
    name: {
      toString () {
        return `Some name`
      }
    }
  })
  t.is(user.name, 'Some name')
})

test(`minlength`, async t => {
  /**
   * Setting `minlength` validates given `String` has a minimum length.
   */
  const nameSchema = new Schema({
    name: {
      type: String,
      minlength: 6
      // minlength: [6, 'Looking for a custom error message?']
    }
  })

  const error = t.throws(() => nameSchema.parse({ name: 'Tin' }))
  t.is(error.message, `Data is not valid`)
  t.is(error.errors[0].message, `Invalid minlength`)
  // t.is(error.errors[0].message, `Looking for a custom error message?`)
  t.is(error.errors[0].field.fullPath, `name`)

  t.notThrows(() => nameSchema.parse({ name: 'Martin' }), `Martin`)
})

test(`maxlength`, async t => {
  /**
   * Setting `maxlength` validates given `String` has a maximum length of...
   */
  const lastNameSchema = new Schema({
    lastName: {
      type: String,
      maxlength: 13
      // maxlength: [13, 'Looking for a custom error message?']
    }
  })

  const error = t.throws(() => lastNameSchema.parse({ lastName: 'Schwarzenegger' }))
  t.is(error.message, `Data is not valid`)
  t.is(error.errors[0].message, `Invalid maxlength`)
  // t.is(error.errors[0].message, `Looking for a custom error message?`)

  t.notThrows(() => lastNameSchema.parse({ lastName: 'Gonzalez' }))
})

test('regex', async t => {
  /**
   * Setting `regex` provides a validation via regular expression against given values.
   */
  const nameSchema = new Schema({
    name: {
      type: String,
      regex: /^[a-z]+$/i
    }
  })

  const error = t.throws(() => nameSchema.parse({ name: 'Tin Rafael' }))
  t.is(error.message, `Data is not valid`)
  t.is(error.errors[0].message, `Invalid regex`)

  t.notThrows(() => nameSchema.parse({ name: 'Martin' }))

  /**
   * Custom error
   */
  const nameSchema2 = new Schema({
    name: {
      type: String,
      regex: [/^[a-z]+$/i, 'lowercase only']
    }
  })

  const error2 = t.throws(() => nameSchema2.parse({ name: 'Tin Rafael' }))
  t.is(error2.message, `Data is not valid`)
  t.is(error2.errors[0].message, `lowercase only`)
})

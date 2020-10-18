import test from 'ava'
import { Schema } from '../../../.'

test('String', async t => {
  /**
   * Validates `String`'s.
   */
  const stringSchema = new Schema({
    name: String
  })

  const error = await t.throwsAsync(() => stringSchema.parse({ name: 123 }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid string')
  t.is(error.errors[0].field.fullPath, 'name')
})

test('autoCast (default `false`)', async t => {
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

  const user = await nameSchema.parse({
    name: {
      toString () {
        return `Some name`
      }
    }
  })
  t.is(user.name, 'Some name')
})

test('minlength', async t => {
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

  const error = await t.throwsAsync(() => nameSchema.parse({ name: 'Tin' }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid minlength')
  // t.is(error.errors[0].message, `Looking for a custom error message?`)
  t.is(error.errors[0].field.fullPath, 'name')

  t.notThrows(() => nameSchema.parse({ name: 'Martin' }), 'Martin')
})

test('maxlength', async t => {
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

  const error = await t.throwsAsync(() => lastNameSchema.parse({ lastName: 'Schwarzenegger' }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid maxlength')
  // t.is(error.errors[0].message, `Looking for a custom error message?`)

  await t.notThrowsAsync(() => lastNameSchema.parse({ lastName: 'Rafael' }))
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

  const error = await t.throwsAsync(() => nameSchema.parse({ name: 'Tin Rafael' }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid regex')

  await t.notThrowsAsync(() => nameSchema.parse({ name: 'Martin' }))

  /**
   * Custom error
   */
  const nameSchema2 = new Schema({
    name: {
      type: String,
      regex: [/^[a-z]+$/i, 'lowercase only']
    }
  })

  const error2 = await t.throwsAsync(() => nameSchema2.parse({ name: 'Tin Rafael' }))
  t.is(error2.message, 'Data is not valid')
  t.is(error2.errors[0].message, 'lowercase only')
})

test('enum', async t => {
  const mySchema = new Schema({
    topping: {
      type: String,
      enum: ['cheese', 'ham', 'tomatoes']
    }
  })
  const error = await t.throwsAsync(() => mySchema.parse({ topping: 'potatoes' }))
  t.is(error.errors[0].message, 'Unknown enum option potatoes')
  await t.notThrowsAsync(() => mySchema.parse({ topping: 'ham' }))
})

test('lowercase', async t => {
  /**
   * Optionally transforms input string into lowercase
   */
  const mySchema = new Schema({
    type: String,
    lowercase: true
  })
  t.is(await mySchema.parse('ADMIN'), 'admin')
})

test('uppercase', async t => {
  /**
   * Optionally transforms input string into uppercase
   */
  const mySchema = new Schema({
    type: String,
    uppercase: true
  })
  t.is(await mySchema.parse('en'), 'EN')
})

test('allowEmpty (default `true`)', async t => {
  /**
   * Optionally allow empty values
   */
  const emptyString = new Schema({
    type: String
  })
  t.is(await emptyString.parse(''), '')

  const nonEmptyString = new Schema({
    type: String,
    allowEmpty: false
  })
  const error = await t.throwsAsync(nonEmptyString.parse(''))

  t.is(error.message, 'Value can not be empty')
})

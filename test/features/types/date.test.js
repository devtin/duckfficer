import test from 'ava'
import { Schema } from '../../../.'

test(`Date`, t => {
  /**
   * Validates `Date`'s
   */
  const dateValidator = new Schema({
    name: String,
    birthday: Date
  })

  let contact
  t.notThrows(() => {
    contact = dateValidator.parse({
      name: 'Martin',
      birthday: new Date('6/11/1983')
    })
  })

  const error = t.throws(() => dateValidator.parse({
    name: 'Martin',
    birthday: `Somewhere in the 80s`
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid date')
})

test('autoCast (default `true`)', t => {
  /**
   * Date transformer has a built-in cast function that transforms proper `String`-dates into `Date`'s.
   */
  const dateValidator = new Schema({
    name: String,
    birthday: Date
  })

  let contact
  t.notThrows(() => {
    contact = dateValidator.parse({
      name: 'Martin',
      birthday: '6/11/1983' // this is a string originally
    })
  })

  t.true(contact.birthday instanceof Date)

  /**
   * `String`'s that can not be guessed as `Date`'s would result in an error.
   */
  const error = t.throws(() => dateValidator.parse({
    name: 'Martin',
    birthday: `Somewhere in the 80s`
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid date')
  t.is(error.errors[0].field.fullPath, 'birthday')

  /**
   * **Turning off autoCast**
   */
  const dateValidator2 = new Schema({
    name: String,
    birthday: {
      type: Date,
      autoCast: false
    }
  })
  const error2 = t.throws(() => dateValidator2.parse({
    name: 'Martin',
    birthday: '6/11/1983'
  }))

  t.is(error2.message, 'Data is not valid')
  t.is(error2.errors[0].message, 'Invalid date')
  t.is(error2.errors[0].field.fullPath, 'birthday')
})

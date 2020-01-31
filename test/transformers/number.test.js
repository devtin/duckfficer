import test from 'ava'
import { Schema, ValidationError } from '../../'

test(`Number`, t => {
  /**
   * Validates `Number`s.
   */
  const ProductType = new Schema({
    user: String,
    age: Number
  })

  const error = t.throws(() => ProductType.parse({
    user: 'tin',
    age: '36'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid number')
  t.is(error.errors[0].field.fullPath, 'age')

  let contact
  t.notThrows(() => {
    contact = ProductType.parse({
      user: 'tin',
      age: 36
    })
  })

  t.is(contact.user, 'tin')
  t.is(contact.age, 36)
})

test('autoCast (default `false`)', t => {
  /**
   * `Number` transformer accepts has a built-in auto-casting function that would convert any numeric representation
   * `String` into a proper `Number`. This feature is off by default.
   */
  const ProductType = new Schema({
    user: String,
    age: {
      type: Number,
      autoCast: true
    }
  })

  let contact
  t.notThrows(() => {
    contact = ProductType.parse({
      user: 'tin',
      age: '36'
    })
  })

  t.is(contact.user, 'tin')
  t.is(contact.age, 36)

  const error = t.throws(() => ProductType.parse({
    user: 'tin',
    age: 'thirty six'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid number')
  t.is(error.errors[0].field.fullPath, 'age')
})

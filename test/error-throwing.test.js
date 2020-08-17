import test from 'ava'
import { Schema, ValidationError, Transformers } from '../'

test('All error throwing transformers must throw a ValidationError', t => {
  const transformersToTest = {
    Object: 1,
    Array: 1,
    Set: 1,
    Number: 'p',
    Date: 'p',
    Function: 1
  }

  t.plan(Object.keys(transformersToTest).length)

  Object.keys(transformersToTest).forEach(type => {
    const instance = new Schema({
      type
    })

    try {
      instance.parse(transformersToTest[type])
    } catch (err) {
      t.true(err instanceof ValidationError)
      t.log(`error thrown by type ${type} is${!(err instanceof ValidationError) ? ' not' : ''} a ValidationError`)
    }
  })
})

test('Type errors are configured via the `typeError` setting', t => {
  Object.keys(Transformers).forEach(typeName => {
    const typeError = `some custom error for ${typeName}`
    const error = t.throws(() => (new Schema({
      type: typeName,
      typeError
    })).parse(null))
    t.is(error.message, typeError)
  })
})

test('Converts errors toJSON', t => {
  const field = new Schema({
    type: String
  }, {
    name: 'somePath'
  })

  const error = new ValidationError('Some error', {
    field
  }).toJSON()

  t.truthy(field)
  t.is(error.message, 'Some error')
  t.is(error.field, 'somePath')
})

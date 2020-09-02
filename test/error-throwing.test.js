import test from 'ava'
import { Schema, ValidationError, Transformers, Utils } from '../'

const { PromiseEach } = Utils

test('All error throwing transformers must throw a ValidationError', async t => {
  const transformersToTest = {
    Object: 1,
    Array: 1,
    Set: 1,
    Number: 'p',
    Date: 'p',
    Function: 1
  }

  t.plan(Object.keys(transformersToTest).length)

  await PromiseEach(Object.keys(transformersToTest), async type => {
    const instance = new Schema({
      type
    })

    try {
      await instance.parse(transformersToTest[type])
    } catch (err) {
      t.true(err instanceof ValidationError)
      t.log(`error thrown by type ${type} is${!(err instanceof ValidationError) ? ' not' : ''} a ValidationError`)
    }
  })
})

test('Type errors are configured via the `typeError` setting', async t => {
  await PromiseEach(Object.keys(Transformers), async typeName => {
    const typeError = `some custom error for ${typeName}`
    const error = await t.throwsAsync(() => (new Schema({
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

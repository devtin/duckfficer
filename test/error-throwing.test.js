import test from 'ava'
import { Schema, ValidationError } from '../'

test(`All error throwing transformers must throw a ValidationError`, t => {
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
      t.log(`error thrown by type ${ type } is${ !(err instanceof ValidationError) ? ' not' : '' } a ValidationError`)
    }
  })
})

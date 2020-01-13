import test from 'ava'
import { Schema, ValidationError } from '../../'

test(`Parses numbers`, t => {
  const ProductType = new Schema({
    user: String,
    age: Number
  })

  let product = ProductType.parse({
    user: 'tin',
    age: '36'
  })

  t.true(typeof product.age === 'number')
  t.not(product.age, '36')
  t.is(product.age, 36)

  const error = t.throws(() => ProductType.parse({
    user: 'tin',
    age () {
      return 36
    }
  }))

  t.is(error.message, 'Data is not valid')
  t.true(error instanceof ValidationError)
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, `Invalid number`)
})

import test from 'ava'
import { Schema } from '../../'

test(`Function`, t => {
  const ProductType = new Schema({
    user: String,
    save: Function
  })

  let product = ProductType.parse({
    user: 'tin',
    save () {
      return 'yeah!'
    }
  })

  t.true(typeof product.save === 'function')
  t.is(product.save(), 'yeah!')

  const error = t.throws(() => ProductType.parse({
    user: 'tin',
    save: false
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid function')
})

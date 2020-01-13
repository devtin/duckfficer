import test from 'ava'
import { Schema } from '../../'

test(`Parses booleans`, t => {
  const ProductType = new Schema({
    user: String,
    active: {
      type: Boolean,
      default: false
    }
  })

  let product = ProductType.parse({
    user: 'tin',
    active: 1
  })

  t.true(product.active)

  product = ProductType.parse({
    user: 'tin'
  })

  t.false(product.active)
})

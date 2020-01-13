import test from 'ava'
import { Schema } from '../../'

test(`Parses sets`, t => {
  const ProductType = new Schema({
    name: String,
    category: {
      type: Set,
      required: true
    }
  })

  const product = ProductType.parse({
    name: 'Kombucha',
    category: ['Beverages', 'Health', 'Tea', 'Health']
  })

  t.false(Array.isArray(product.category))
  t.is(product.category.size, 3)
  t.true(product.category.has('Health'))

  try {
    ProductType.parse({
      name: 'Kombucha',
      category: 'none'
    })
    t.fail(`Invalid set was resolved!`)
  } catch (err) {
    t.is(err.message, `Data is not valid`) // => Data is not valid
    t.is(err.errors[0].message, 'Invalid set') // => Invalid date
    t.is(err.errors[0].field.fullPath, 'category')
  }
})

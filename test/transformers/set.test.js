import test from 'ava'
import { Schema } from '../../'

test(`Set`, t => {
  const ProductType = new Schema({
    name: String,
    category: Set
  })

  const product = ProductType.parse({
    name: 'Kombucha',
    category: ['Beverages', 'Health', 'Tea', 'Health']
  })

  t.false(Array.isArray(product.category))
  t.is(product.category.size, 3)
  t.true(product.category.has('Health'))

  const error = t.throws(() => ProductType.parse({
    name: 'Kombucha',
    category: 'none'
  }))

  t.is(error.message, `Data is not valid`)
  t.is(error.errors[0].message, 'Invalid set')
  t.is(error.errors[0].field.fullPath, 'category')
})

test('autoCast (default `true`)', t => {
  const ProductType = new Schema({
    name: String,
    category: {
      type: Set,
      autoCast: false
    }
  })

  const product = ProductType.parse({
    name: 'Kombucha',
    category: new Set(['Beverages', 'Health', 'Tea', 'Health'])
  })

  t.false(Array.isArray(product.category))
  t.is(product.category.size, 3)
  t.true(product.category.has('Health'))

  const error = t.throws(() => ProductType.parse({
    name: 'Kombucha',
    category: ['Beverages', 'Health', 'Tea', 'Health']
  }))
  t.is(error.message, `Data is not valid`)
  t.is(error.errors[0].message, 'Invalid set')
  t.is(error.errors[0].field.fullPath, 'category')
})

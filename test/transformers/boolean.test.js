import test from 'ava'
import { Schema } from '../../'

test(`Boolean`, t => {
  /**
   * Validates `Boolean`s.
   */

  const ProductType = new Schema({
    name: String,
    active: {
      type: Boolean,
      default: false,
    }
  })

  const error = t.throws(() => ProductType.parse({
    name: 'Kombucha',
    active: 'no'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid boolean')

  let product1
  t.notThrows(() => {
    product1 = ProductType.parse({
      name: 'Kombucha',
      active: true
    })
  })

  t.truthy(product1)
  t.true(product1.active)

  let product2
  t.notThrows(() => {
    product2 = ProductType.parse({
      name: 'tin'
    })
  })

  t.truthy(product2)
  t.false(product2.active)
})

test('autoCast (default `false`)', t => {
  /**
   * `Boolean`'s have a built-in auto-casting function that would transform any truthy value into `true`,
   * falsy values into `false`, when enabled. This setting is `false` by default.
   */

  const ProductType = new Schema({
    name: String,
    active: {
      type: Boolean,
      default: false,
      autoCast: true // has to be enabled
    }
  })

  let product
  t.notThrows(() => {
    product = ProductType.parse({
      name: 'Kombucha',
      active: 'no'
    })
  })

  t.true(product.active)
})

import test from 'ava'
import { Schema } from '../../../.'

test('Boolean', async t => {
  /**
   * Validates `Boolean`s.
   */

  const ProductSchema = new Schema({
    name: String,
    active: {
      type: Boolean,
      default: false
    }
  })

  const error = await t.throwsAsync(() => ProductSchema.parse({
    name: 'Kombucha',
    active: 'no'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid boolean')

  let product1
  await t.notThrowsAsync(async () => {
    product1 = await ProductSchema.parse({
      name: 'Kombucha',
      active: true
    })
  })

  t.truthy(product1)
  t.true(product1.active)

  let product2
  await t.notThrowsAsync(async () => {
    product2 = await ProductSchema.parse({
      name: 'tin'
    })
  })

  t.truthy(product2)
  t.false(product2.active)
})

test('autoCast (default `false`)', async t => {
  /**
   * `Boolean`'s have a built-in auto-casting function that would transform any truthy value into `true`,
   * falsy values into `false`, when enabled. This setting is `false` by default.
   */

  const ProductType = new Schema({
    name: String,
    active: {
      type: Boolean,
      default: false,
      autoCast: true, // has to be enabled
      cast (v) {
        if (typeof v === 'string' && /no/i.test(v)) {
          return false
        }
        return v
      }
    }
  })

  let product
  await t.notThrowsAsync(async () => {
    product = await ProductType.parse({
      name: 'Kombucha',
      active: 'sure!'
    })
  })

  t.true(product.active)

  t.false((await ProductType.parse({ name: 'kombucha', active: 'no' })).active)
})

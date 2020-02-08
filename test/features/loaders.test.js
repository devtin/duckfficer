import test from 'ava'
import { Schema } from '../../'

test(`Loaders`, t => {
  /**
   * Loaders can be seen as a way of piping transformers.
   */

  const User = new Schema({
    id: {
      type: String,
      loaders: [Number],
      cast (aNumber) {
        return `#${ aNumber }`
      }
    },
    name: String
  })

  const error = t.throws(() => User.parse({
    id: '123',
    name: 'Kombucha'
  }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid number')

  let product
  t.notThrows(() => {
    product = User.parse({
      id: 123,
      name: 'Kombucha'
    })
  })
  t.truthy(product)
  t.is(product.id, '#123')
})

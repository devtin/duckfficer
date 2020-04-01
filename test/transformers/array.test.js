import test from 'ava'
import { Schema } from '../../'

test(`Array`, t => {
  /**
   * Initializes `Array` types
   */
  const ProductType = new Schema({
    name: String,
    category: Array
  })

  const product = ProductType.parse({
    name: 'Kombucha',
    category: ['Beverages', 'Tea', 'Health']
  })

  t.true(Array.isArray(product.category))
  t.is(product.category.length, 3)
  t.is(product.category[1], 'Tea')

  /**
   * Given an invalid `Array` it will throw a `ValidationError`
   */

  const error = t.throws(() => ProductType.parse({
    name: 'Kombucha',
    category: 'none' // < not an array
  }))

  t.is(error.message, `Data is not valid`)
  t.is(error.errors[0].message, 'Invalid array')
  t.is(error.errors[0].field.fullPath, 'category')
})

test(`arraySchema`, t => {
  /**
   * The Array transformer can initialize the items in the array by passing them through the transformer specified in
   * the `arraySchema` setting.
   */
  const Log = new Schema({
    user: String,
    lastAccess: {
      type: Array,
      arraySchema: {
        type: Date,
        autoCast: true
      }
    }
  })

  const tinLog = Log.parse({
    user: 'tin',
    lastAccess: ['6/11/2019', 'Sat Jan 11 2020 17:06:31 GMT-0500 (Eastern Standard Time)']
  })

  t.true(Array.isArray(tinLog.lastAccess))
  t.is(tinLog.lastAccess.length, 2)
  t.true(tinLog.lastAccess[0] instanceof Date)
  t.true(tinLog.lastAccess[1] instanceof Date)

  const error = t.throws(() => Log.parse({
    user: 'tin',
    lastAccess: ['6/11/1983', 'What is love?']
  }))

  t.is(error.message, `Data is not valid`)
  t.is(error.errors[0].message, 'Invalid date')
  t.is(error.errors[0].field.fullPath, 'lastAccess.1')

  /**
   * You can also use custom schemas
   */
  const Email = new Schema({
    type: String,
    regex: [/^[a-z0-9._]+@[a-z0-9-.]+\.[a-z]{2,}$/i, 'Invalid e-mail address { value }']
  })

  const Contact = new Schema({
    name: String,
    emails: {
      type: Array,
      arraySchema: {
        type: Email
      }
    }
  })

  const error2 = t.throws(() => Contact.parse({
    name: 'Martin',
    emails: ['tin@devtin.io', 'gmail.com']
  }))

  t.is(error2.message, 'Data is not valid')
  t.is(error2.errors[0].message, 'Invalid e-mail address gmail.com')
  t.is(error2.errors[0].field.fullPath, `emails.1`)

  t.notThrows(() => Contact.parse({
    name: 'Martin',
    emails: ['tin@devtin.io', 'martin@gmail.com']
  }))
})

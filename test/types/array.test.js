import test from 'ava'
import { Schema } from '../../'

test(`Parses arrays`, t => {
  const ProductType = new Schema({
    name: String,
    category: {
      type: Array,
      required: true
    }
  })

  const product = ProductType.parse({
    name: 'Kombucha',
    category: ['Beverages', 'Tea', 'Health']
  })

  t.true(Array.isArray(product.category))
  t.is(product.category.length, 3)
  t.is(product.category[1], 'Tea')

  try {
    ProductType.parse({
      name: 'Kombucha',
      category: 'none'
    })
    t.fail(`Invalid array was resolved!`)
  } catch (err) {
    t.is(err.message, `Data is not valid`) // => Data is not valid
    t.is(err.errors[0].message, 'Invalid array') // => Invalid date
    t.is(err.errors[0].field.fullPath, 'category')
  }
})

test(`Optionally describes the type of items to store, initializing them.`, t => {
  const Log = new Schema({
    user: String,
    lastAccess: {
      type: Array,
      items: {
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

  try {
    Log.parse({
      user: 'tin',
      lastAccess: ['6/11/1983', 'What is love?']
    })
    t.fail(`Invalid date was resolved!`)
  } catch (err) {
    t.is(err.message, `Data is not valid`)
    t.is(err.errors[0].message, 'Invalid date')
    t.is(err.errors[0].field.fullPath, 'lastAccess.1')
  }
})

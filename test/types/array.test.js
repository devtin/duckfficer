import test from 'ava'
import { Schema } from '../../'

test(`Arrays can describe the type of items they store, initializing them.`, t => {
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

  t.true(Array.isArray(tinLog.lastAccess)) // => true
  t.is(tinLog.lastAccess.length, 2) // => 2
  t.true(tinLog.lastAccess[0] instanceof Date) // => true
  t.true(tinLog.lastAccess[1] instanceof Date) // => true

  try {
    Log.parse({
      user: 'tin',
      lastAccess: ['6/11/1983', 'What is love?']
    })
    t.fail(`Invalid date was resolved!`)
  } catch (err) {
    t.is(err.message, `Data is not valid`) // => Data is not valid
    t.is(err.errors[0].message, 'Invalid date') // => Invalid date
    t.is(err.errors[0].field.path) // => lastAccess.1
  }
})

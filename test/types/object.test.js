import test from 'ava'
import { Schema } from '../../'

test(`Parses objects`, t => {
  const Transaction = new Schema({
    created: {
      type: Date,
      default: Date.now
    },
    payload: Object // this object could be anything with any props
  })

  const payload = {
    the: {
      object: {
        can: {
          have: {
            anything: true
          }
        }
      }
    }
  }

  const product = Transaction.parse({
    payload
  })

  t.is(product.payload, payload) // remains untouched

  try {
    Transaction.parse({
      payload: 'none'
    })
    t.fail(`Invalid object was resolved!`)
  } catch (err) {
    t.is(err.message, `Data is not valid`) // => Data is not valid
    t.is(err.errors[0].message, 'Invalid object') // => Invalid date
    t.is(err.errors[0].field.fullPath, 'payload')
  }
})

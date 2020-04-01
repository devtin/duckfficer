import test from 'ava'
import { Schema } from '../../'

test(`Object`, t => {
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

  const error = t.throws(() => Transaction.parse({
    payload: 'none'
  }))

  t.is(error.message, `Data is not valid`) // => Data is not valid
  t.is(error.errors[0].message, 'Invalid object') // => Invalid date
  t.is(error.errors[0].field.fullPath, 'payload')
})

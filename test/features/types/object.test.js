import test from 'ava'
import { Schema } from '../../../.'

test('Object', async t => {
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

  const product = await Transaction.parse({
    payload
  })

  t.is(product.payload, payload) // remains untouched

  const error = await t.throwsAsync(() => Transaction.parse({
    payload: 'none'
  }))

  t.is(error.message, 'Data is not valid') // => Data is not valid
  t.is(error.errors[0].message, 'Invalid object') // => Invalid date
  t.is(error.errors[0].field.fullPath, 'payload')
})

test('mapSchema', async t => {
  /**
   * We can optionally define the schema of the properties of an object.
   */

  const ObjectWith = new Schema({
    type: Object,
    mapSchema: Number
  })

  const error = await t.throwsAsync(() => ObjectWith.parse({
    papo: 123,
    papilla: '123'
  }))
  t.is(error.message, 'Invalid number')
  t.is(error.value, '123')
  t.is(error.field.fullPath, 'papilla')

  /**
   * You can also use custom schemas
   */

  const Email = new Schema({
    type: String,
    regex: [/^[a-z0-9._]+@[a-z0-9-.]+\.[a-z]{2,}$/i, 'Invalid e-mail address']
  })

  const Contact = new Schema({
    name: String,
    email: {
      type: Object,
      mapSchema: {
        type: Email
      }
    }
  })

  const error2 = await t.throwsAsync(() => Contact.parse({
    name: 'Martin',
    email: {
      work: 'tin@devtin.io',
      home: '@gmail.com'
    }
  }))

  t.is(error2.message, 'Data is not valid')
  t.is(error2.errors[0].message, 'Invalid e-mail address')
  t.is(error2.errors[0].field.fullPath, 'email.home')

  await t.notThrowsAsync(() => Contact.parse({
    name: 'Martin',
    email: {
      work: 'tin@devtin.io',
      home: 'martin@gmail.com'
    }
  }))
})

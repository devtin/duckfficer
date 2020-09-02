import test from 'ava'
import { Schema, ValidationError } from '../../../.'

test('BigInt', async t => {
  /**
   * Validates `BigInt`s.
   */
  const UserSchema = new Schema({
    user: String,
    id: BigInt
  })

  const error = await t.throwsAsync(() => UserSchema.parse({
    user: 'tin',
    id: 1
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid bigint')
  t.is(error.errors[0].field.fullPath, 'id')

  let contact
  await t.notThrowsAsync(async () => {
    contact = await UserSchema.parse({
      user: 'tin',
      id: 1n
    })
  })

  t.is(contact.user, 'tin')
  t.is(contact.id, 1n)
})

test('autoCast (default `false`)', async t => {
  /**
   * [BigInt](/api.md#Transformers.BigInt) transformer has a built-in auto-casting function that would convert any numeric
   * representation of a `String` or a `Number` into a proper `BigInt`. This feature is disabled by default.
   */
  const UserSchema = new Schema({
    user: String,
    id: BigInt
  })

  await t.throwsAsync(() => UserSchema.parse({
    user: 'tin',
    id: '1'
  }))

  /**
   * To enable it, just pass the setting `autoCast` equaled to `true`
   */

  const UserSchema2 = new Schema({
    user: String,
    id: {
      type: BigInt,
      autoCast: true
    }
  })

  let contact
  await t.notThrowsAsync(async () => {
    contact = await UserSchema2.parse({
      user: 'tin',
      id: '1' // < numeric string
    })
  })

  t.is(contact.user, 'tin')
  t.is(contact.id, 1n)

  const error = await t.throwsAsync(() => UserSchema2.parse({
    user: 'tin',
    id: 'some huge integer'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid bigint')
  t.is(error.errors[0].field.fullPath, 'id')
})

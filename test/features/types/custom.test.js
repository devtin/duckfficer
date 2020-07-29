import test from 'ava'
import { Schema, Transformers } from '../../../.'

test('Custom', t => {
  /**
   * Custom transformers are great to implement custom logic that may be required by multiple entities of the ecosystem.
   */
  const customTransformer = new Schema({
    name: {
      type: String,
      required: false
    },
    email: {
      type: 'Email',
      onlyGmail: true
    }
  })

  let error = t.throws(() => customTransformer.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Don\'t know how to resolve Email in property email')

  /**
   * Creating a custom transformer is as simple as appending the logic into the Transformers object
   * found in `const { Transformers } = require('@devtin/schema-validator')`.
   *
   * Have a look at the [Transformer](/DOCS.md#Transformer) object in the docs.
   */

  Transformers.Email = {
    loaders: [
      {
        type: String,
        regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, 'Invalid e-mail address { value } for field { field.name }']
      }
    ], // pre-processes the value using this known-registered types
    validate (v) {
      t.true(this instanceof Schema)
      if (this.settings.onlyGmail && !/@gmail\.com$/.test(v)) {
        return this.throwError('Only gmail accounts')
      }
    }
  }

  error = t.throws(() => customTransformer.parse({
    name: 'Martin',
    email: 123
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid string') // From the String transformer

  error = t.throws(() => customTransformer.parse({
    name: 'Martin',
    email: 'martin'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid e-mail address martin for field email')

  error = t.throws(() => customTransformer.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Only gmail accounts')

  t.notThrows(() => customTransformer.parse({
    name: 'Martin',
    email: 'marting.dc@gmail.com'
  }))
})

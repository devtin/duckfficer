import test from 'ava'
import { Schema, Transformers, ValidationError } from '../../'

test('Validating and sanitizing arbitrary objects', async t => {
  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    description: Array
  }, {
    stripUnknown: false
  })

  /**
   * Think of an *arbitrary object* as one coming from an unreliable source, i.e. passed in an http request;
   * or maybe retrieved by a manual input from a terminal application.
   */

  const arbitraryObject = {
    firstName: 'Martin',
    lastName: 'Rafael',
    birthday: '11/11/1999',
    address: {
      zip: 305
    },
    description: ['monkey', 'developer', 'arepa lover']
  }

  /**
   * Above's object `arbitraryObject` contains properties that do not exist in the schema: `firstName`,
   * `middleName` and `lastName`, are not defined in the schema.
   *
   * Following validation will result in an error since the arbitrary object does not match the schema: it contains
   * these 3 unknown properties. The schema validator will first perform a structure validation making sure the payload
   * structure matches the provided schema structure, prior performing any type validation / further logic.
   *
   * Even when the property `name` (expected by the defined schema) is also missing, it won't be reported since the
   * payload's schema structure doest not match the provided one.
   */

  let error = await t.throwsAsync(() => UserSchema.parse(arbitraryObject))

  t.true(error instanceof ValidationError)
  t.true(error instanceof Error)
  t.is(error.message, 'Invalid object schema')
  t.is(error.errors.length, 3)
  t.is(error.errors[0].message, 'Unknown property firstName')
  t.is(error.errors[1].message, 'Unknown property lastName')
  t.is(error.errors[2].message, 'Unknown property address.zip')

  /**
   * When the payload's structure matches the schema (all of the payload properties are defined in the schema) it will
   * then proceed with further validations...
   */

  error = await t.throwsAsync(() => UserSchema.parse({
    birthday: '11/11/1999',
    description: ['monkey', 'developer', 'arepa lover']
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Property name is required')

  /**
   * A custom `state` can be passed to extend the validation process.
   */

  const AnotherUserSchema = new Schema({
    name: String,
    email: {
      type: String,
      required: false
    },
    level: {
      type: String,
      validate (v, { state }) {
        if (v === 'admin' && !state?.user) {
          this.throwError('Only authenticated users can set the level to admin')
        }
      }
    }
  }, {
    validate (v, { state }) {
      if (state.user.level !== 'root' && v.level === 'admin' && !v.email) {
        this.throwError('Admin users require an email')
      }
    }
  })

  error = await t.throwsAsync(() => AnotherUserSchema.parse({
    name: 'Martin Rafael',
    level: 'admin'
  }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Only authenticated users can set the level to admin')
  t.is(error.errors[0].field.fullPath, 'level')

  error = await t.throwsAsync(() => AnotherUserSchema.parse({
    name: 'Martin Rafael',
    level: 'admin'
  }, {
    state: {
      user: {
        name: 'system',
        level: 'admin'
      }
    }
  }))

  t.is(error.message, 'Admin users require an email')

  t.notThrows(() => {
    return AnotherUserSchema.parse({
      name: 'Martin Rafael',
      level: 'admin'
    }, {
      state: {
        user: {
          name: 'system',
          level: 'root'
        }
      }
    })
  })
})

test('Built-in validation (provided by types or transformers)', t => {
  /**
   * A wide variety of type-validators are provided built-in many of them with extra-helpers to enhance the validation
   * logic. Refer to the [Types](#types) section below for available type validators and helpers.
   */

  t.deepEqual(Object.keys(Transformers), [
    'Array',
    'BigInt',
    'Boolean',
    'Date',
    'Function',
    'Map',
    'Number',
    'Object',
    'Set',
    'String'
  ])
})

test('Custom property validation hook (provided at schema-setting level)', async t => {
  /**
   * The [validate](/api.md#Caster) hook can be use within a [SchemaSetting](/api.md#Schema..SchemaSettings) to provide
   * extra validation logic.
   */

  const ProductSchema = new Schema({
    id: Number,
    created: {
      type: Date,
      validate (date, { state }) {
        t.is(state, givenState)
        if (Date.parse(date) < Date.parse('2019/1/1')) {
          this.throwError('Orders prior 2019 have been archived')
        }
      }
    },
    name: String
  })

  const givenState = { someState: true }

  t.notThrows(() => ProductSchema.parse({
    id: 123,
    created: '2020/2/1',
    name: 'Kombucha'
  }, { state: givenState }))

  const error = await t.throwsAsync(() => ProductSchema.parse({
    id: 123,
    created: '2018/12/1',
    name: 'Kombucha'
  }, { state: givenState }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Orders prior 2019 have been archived')
  t.is(error.errors[0].field.fullPath, 'created')
})

test('Custom value validation hook (provided at schema level)', async t => {
  const ProductSchema = new Schema({
    id: Number,
    name: String,
    price: Number
  },
  {
    validate (v, { state }) {
      t.is(state, givenState)
      if (v.id < 200) {
        this.throwError('Product deprecated')
      }
    }
  })

  const givenState = { someState: true }

  const error = await t.throwsAsync(() => ProductSchema.parse({
    id: 123,
    name: 'Kombucha Green',
    price: 3
  }, {
    state: givenState
  }))

  t.is(error.message, 'Product deprecated')
})

import test from 'ava'
import { Schema, Transformers } from '../../'

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
    'Promise',
    'Set',
    'String'
  ])
})

test('Custom property validation hook (provided at schema-setting level)', t => {
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

  const error = t.throws(() => ProductSchema.parse({
    id: 123,
    created: '2018/12/1',
    name: 'Kombucha'
  }, { state: givenState }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Orders prior 2019 have been archived')
  t.is(error.errors[0].field.fullPath, 'created')
})

test('Custom value validation hook (provided at schema level)', t => {
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

  const error = t.throws(() => ProductSchema.parse({
    id: 123,
    name: 'Kombucha Green',
    price: 3
  }, {
    state: givenState
  }))

  t.is(error.message, 'Product deprecated')
})

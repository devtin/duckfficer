import test from 'ava'
import { Schema } from '../../'

test(`property cast`, t => {
  /**
   * The [cast](/DOCS.md#Caster) hook can be use within a [SchemaSetting](/DOCS.md#Schema..SchemaSettings) to provide
   * extra casting logic.
   */

  const ProductSchema = new Schema({
    id: {
      type: Number,
      cast (v) {
        if (typeof v === 'string' && /^#/.test(v)) {
          return parseInt(v.replace(/^#/, ''))
        }
      }
    },
    name: String
  })

  const error = t.throws(() => {
    return ProductSchema.parse({
      id: '123',
      name: 'Kombucha'
    })
  })
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid number')

  let product
  t.notThrows(() => {
    product = ProductSchema.parse({
      id: '#123',
      name: 'Kombucha'
    })
  })
  t.is(product.id, 123)
})

test(`property validate`, t => {
  /**
   * The [cast](/DOCS.md#Caster) hook can be use within a [SchemaSetting](/DOCS.md#Schema..SchemaSettings) to provide
   * extra validation logic.
   */

  const ProductSchema = new Schema({
    id: Number,
    created: {
      type: Date,
      validate (date) {
        if (Date.parse(date) < Date.parse('2019/1/1')) {
          throw new Error(`Orders prior 2019 have been archived`)
        }
      }
    },
    name: String
  })

  t.notThrows(() => ProductSchema.parse({
    id: 123,
    created: '2020/2/1',
    name: 'Kombucha'
  }))

  const error = t.throws(() => ProductSchema.parse({
    id: 123,
    created: '2018/12/1',
    name: 'Kombucha'
  }))
  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Orders prior 2019 have been archived')
})

test(`schema cast`, t => {
  const ProductSchema = new Schema({
      id: Number,
      name: String,
      price: Number
    },
    {
      cast (v) {
        const month = new Date().getMonth() + 1
        if (/avocado/i.test(v.name) && !(month >= 5 && month <= 8)) {
          v.price += 2 // 2$ extra avocado out of season
        }

        return v
      }
    })

  let product
  t.notThrows(() => {
    product = ProductSchema.parse({
      id: 321,
      name: 'Hass Avocados',
      price: 3.99
    })
  })

  t.truthy(product)
  t.is(product.price, 5.99)
})
test(`schema validate`, t => {
  const ProductSchema = new Schema({
      id: Number,
      name: String,
      price: Number
    },
    {
      validate (v) {
        if (v.id < 200) {
          throw new Error(`Product deprecated`)
        }
      }
    })

  const error = t.throws(() => ProductSchema.parse({
    id: 123,
    name: 'Kombucha Green',
    price: 3
  }))

  t.is(error.message, `Product deprecated`)
})

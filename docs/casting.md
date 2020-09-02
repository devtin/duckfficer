# Casting (sanitation)

- [Built-in cast (provided by types or transformers)](#built-in-cast-provided-by-types-or-transformers)
- [Custom property-cast hook (provided at schema-setting level)](#custom-property-cast-hook-provided-at-schema-setting-level)
- [Custom value cast hook (provided at schema level)](#custom-value-cast-hook-provided-at-schema-level)

## Built-in cast (provided by types or transformers)



Many transformers provide a casting logic available when setting `autoCast` equaled to `true`.

```js
t.deepEqual(Object.keys(Transformers).filter(transformerName => {
  return typeof Transformers[transformerName].cast === 'function' && Transformers[transformerName].settings.hasOwnProperty('autoCast')
}), [
  'BigInt',
  'Boolean',
  'Date',
  'Map',
  'Number',
  'Set',
  'String'
])
```

## Custom property-cast hook (provided at schema-setting level)



The [cast](/api.md#Caster) hook can be use within a [SchemaSetting](/api.md#Schema..SchemaSettings) to provide
extra casting logic.

```js
const ProductSchema = new Schema({
  id: {
    type: Number,
    cast (v, { state }) {
      t.is(state, givenState)
      if (typeof v === 'string' && /^#/.test(v)) {
        return parseInt(v.replace(/^#/, ''))
      }
    }
  },
  name: String
})

const givenState = { someState: true }

const error = await t.throwsAsync(() => {
  return ProductSchema.parse({
    id: '123',
    name: 'Kombucha'
  }, {
    state: givenState
  })
})
t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid number')

let product
await t.notThrowsAsync(async () => {
  product = await ProductSchema.parse({
    id: '#123',
    name: 'Kombucha'
  }, {
    state: givenState
  })
})
t.is(product.id, 123)
```

## Custom value cast hook (provided at schema level)



We can cast (transform) whatever value passed to the parse method prior proceeding with any further logic by using
the schema-level cast hook.

```js
const ProductSchema = new Schema({
  id: Number,
  name: String,
  price: Number
},
{
  // schema-level cast hook
  cast (v, { state }) {
    t.is(state, givenState)
    /*
      const month = new Date().getMonth() + 1
      */
    if (/avocado/i.test(v.name)/* && !(month >= 5 && month <= 8) */) {
      v.price += 2 // 2$ extra avocado out of season
    }

    return v
  }
})

const givenState = { someState: true }
let product
await t.notThrowsAsync(async () => {
  product = await ProductSchema.parse({
    id: 321,
    name: 'Hass Avocados',
    price: 3.99
  }, {
    state: givenState
  })
})

t.truthy(product)
t.is(product.price, 5.99)
```
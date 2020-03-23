## Guide

All features showcased below in this guide are taken straight from some of the tests performed in the [test](/test)
directory. Mind tests are performed using <a href="https://github.com/avajs/ava" target="_blank">AVA</a>. I think the
syntax is pretty self-explanatory but in case you find yourself lost reading the examples below, maybe having a look at
the <a href="https://github.com/avajs/ava" target="_blank">AVA</a> syntax may help you get quickly on track.

**Index**

- [Creating a schema](/guide/README.md#creating-a-schema)
- [Validating arbitrary objects](/guide/README.md#validating-arbitrary-objects)
- [Required properties](/guide/README.md#required-properties)
- [Optional properties](/guide/README.md#optional-properties)
- [Default values](/guide/README.md#default-values)
- [Auto-casting](/guide/README.md#auto-casting)
- [Allowing null values](/guide/README.md#allowing-null-values)
- [Nesting schemas](/guide/README.md#nesting-schemas)
- [Initial settings](/guide/README.md#initial-settings)
- [Multiple types](/guide/README.md#multiple-types)
- [Life-cycle](/guide/README.md#life-cycle)
- [Transformers](/guide/TRANSFORMERS.md)
  - [Array](/guide/TRANSFORMERS.md#array)
  - [BigInt](/guide/TRANSFORMERS.md#big-int)
  - [Boolean](/guide/TRANSFORMERS.md#boolean)
  - [Date](/guide/TRANSFORMERS.md#date)
  - [Function](/guide/TRANSFORMERS.md#function)
  - [Number](/guide/TRANSFORMERS.md#number)
  - [Object](/guide/TRANSFORMERS.md#object)
  - [Promise](/guide/TRANSFORMERS.md#promise)
  - [Set](/guide/TRANSFORMERS.md#set)
  - [String](/guide/TRANSFORMERS.md#string)
  - [Custom](/guide/TRANSFORMERS.md#custom)
- [Hooks](/guide/README.md#hooks)
- [Loaders](/guide/README.md#loaders)

## Creating a schema



In order to check the data integrity of an object, a schema is created defining the expected
structure of the desired object.

```js
const UserSchema = new Schema({
  name: String,
  birthday: Date,
  description: Array
})
```

The created schema has a method called `parse`. This method is used to
(optionally) cast, validate and parse arbitrary objects, returning a newly created schema-compliant object. See the
[Schema](/DOCS.md#Schema) class docs for more information.

```js
t.true(typeof UserSchema.parse === 'function')

const arbitraryObject = {
  name: `Martin Rafael Gonzalez`,
  birthday: new Date('6/11/1983'),
  description: ['monkey', 'developer', 'arepa lover']
}

let safeObject
t.notThrows(() => {
  safeObject = UserSchema.parse(arbitraryObject)
})

t.truthy(safeObject)
t.deepEqual(safeObject, arbitraryObject)
t.true(safeObject !== arbitraryObject)
```

Returned object-properties can now be accessed safely since the object was validated to be schema-compliant.

```js
t.truthy(safeObject)
t.is(safeObject.name, `Martin Rafael Gonzalez`)
t.true(safeObject.birthday instanceof Date)
t.is(safeObject.birthday.getFullYear(), 1983)
t.is(safeObject.description.length, 3)
```

## Validating arbitrary objects



Using the same `UserSchema` example above:

```js
const UserSchema = new Schema({
  name: String,
  birthday: Date,
  description: Array
})
```

Think of an *arbitrary object* as one coming from an unreliable source, i.e. retrieved through a POST request;
or maybe retrieved by a manual input from a terminal application.

```js
const arbitraryObject = {
  firstName: 'Martin',
  middleName: 'Rafael',
  lastName: 'Gonzalez',
  birthday: `6/11/1983`,
  description: ['monkey', 'developer', 'arepa lover']
}
```

Above's object `arbitraryObject` contains properties that do not exist in the schema: `firstName`,
`middleName` and `lastName`, are not defined in the schema.

Following validation will result in an error since the arbitrary object does not match the schema: it contains
these 3 unknown properties, plus the property `name` (expected by the defined schema) is also missing.

```js
const error = t.throws(() => UserSchema.parse(arbitraryObject))

t.true(error instanceof ValidationError)
t.true(error instanceof Error)
t.is(error.message, `Data is not valid`)
t.is(error.errors.length, 4)
t.is(error.errors[0].message, `Unknown property firstName`)
t.is(error.errors[1].message, `Unknown property middleName`)
t.is(error.errors[2].message, `Unknown property lastName`)
t.is(error.errors[3].message, `Property name is required`)
```

## Required properties



A schema defines the structure and data-type expected by an arbitrary object.
All properties are required by default.

```js
const ProductSchema = new Schema({
  name: String,
  stock: Number,
  category: Array
})
```

Whenever a required property is missing, an error is thrown.

```js
let error = t.throws(() => ProductSchema.parse({
  name: 'Kombucha',
  stock: 11
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors.length, 1)
t.is(error.errors[0].message, `Property category is required`)
```

## Optional properties



A schema is created below with an optional-property named `age`.
The property-setting `required` set to `false` is what enables this feature.

```js
const ContactSchema = new Schema({
  name: String,
  email: String,
  age: {
    type: Number,
    required: false // property `age` is optional
  }
})
```

Arbitrary objects can now be validated missing the property `age` as long as they match the rest of the schema.

```js
let contact
t.notThrows(() => {
  contact = ContactSchema.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  })
})

t.notThrows(() => {
  contact = ContactSchema.parse({
    name: 'Martin',
    email: 'tin@devtin.io',
    age: undefined
  })
})
```

Whenever `age` is present, the validation will ensure it is a `Number`, though.

```js
let contact2
const error = t.throws(() => {
  contact2 = ContactSchema.parse({
    name: 'Papo',
    email: 'sandy@papo.com',
    age: `I don't know.`
  })
})

t.is(error.message, `Data is not valid`)
t.is(error.errors.length, 1)
t.is(error.errors[0].message, `Invalid number`)
t.is(error.errors[0].field.fullPath, `age`)

t.notThrows(() => {
  contact2 = ContactSchema.parse({
    name: 'Papo',
    email: 'sandy@papo.com',
    age: 36
  })
})

t.deepEqual(contact2, {
  name: 'Papo',
  email: 'sandy@papo.com',
  age: 36
})
```

## Default values



Default values are meant to be used when an arbitrary object misses the value of the property in subject.

```js
const ContactSchema = new Schema({
  name: String,
  country: {
    type: String,
    default: 'United States'
  }
})
```

When a property is assigned with a `default` value, it is implicitly treated as an optional property (`required`
equaled to `false`). See [optional properties](#optional-properties) for more information.

```js
const error = t.throws(() => new Schema({
  name: String,
  state: {
    type: String,
    required: true,
    default: 'Florida'
  }
}))

t.is(error.message, 'Remove either the \'required\' or the \'default\' option for property state.')

let sanitized
t.notThrows(() => {
  sanitized = ContactSchema.parse({
    name: 'Martin'
  })
})

t.deepEqual(sanitized, {
  name: 'Martin',
  country: 'United States'
})
```

A default value could also be a function. Refer to the [SchemaSettings](/DOCS.md#schemaschemasettings--object) docs
for more information.

```js
const UserSchema = new Schema({
  name: String,
  registered: {
    type: Date,
    default: Date.now
  }
})

let Martin
t.notThrows(() => {
  Martin = UserSchema.parse({
    name: 'Martin'
  })
})

t.deepEqual(Object.keys(Martin), ['name', 'registered'])
t.true(Martin.registered instanceof Date)
```

## Auto-casting



Most transformers provide an option for auto-casting. When property-setting `autoCast` equals `true`
(depending on the transformer) it may try to resolve given arbitrary value into the expected one.

For example, the [Date](#date) transformer will try to cast values given as `String`'s into a proper `Date`, if possible.
The [Number](#number) transformer as well: will try to resolve those `String`'s that look like a number and convert them into
a proper `Number`.

```js
const UserSchema = new Schema({
  name: String,
  birthday: Date,
  kids: {
    type: Number,
    autoCast: true
  }
})

let Olivia

t.notThrows(() => {
  Olivia = UserSchema.parse({
    name: 'Olivia',
    birthday: '8/31/2019',
    kids: '0'
  })
})

t.true(Olivia.birthday instanceof Date)
t.is(typeof Olivia.kids, 'number')
```

**Turning off auto-casting**

Now, when a strict validation is required, this feature can be turned off.

```js
const StrictUserSchema = new Schema({
  name: String,
  birthday: {
    type: Date,
    autoCast: false
  },
  kids: {
    type: Number,
    autoCast: false
  }
})

const error = t.throws(() => StrictUserSchema.parse({
  name: 'Martin',
  birthday: '6/11/1983',
  kids: '1'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors.length, 2)
t.is(error.errors[0].message, `Invalid date`)
t.is(error.errors[0].field.fullPath, `birthday`)
t.is(error.errors[1].message, `Invalid number`)
t.is(error.errors[1].field.fullPath, `kids`)
```

## Allowing null values



Sometimes it is useful to allow a property to accept null values no matter what type it has.
Property-setting `allowNull` allows you to do so.

```js
const RegularSchema = new Schema({
  type: String
})
const error = t.throws(() => RegularSchema.parse(null))
t.is(error.message, 'Invalid string')

const NullSchema = new Schema({
  type: String,
  // allowing null values!
  allowNull: true
})
t.is(NullSchema.parse(null), null)
```

## Nesting schemas



We can use a previously defined schema in order to extend the validation of other schemas.

```js
const AddressSchema = new Schema({
  line1: String,
  line2: {
    type: String,
    required: false,
  },
  zip: {
    type: Number,
    required: false
  }
}, {
  name: 'AddressSchema'
})

const UserSchema = new Schema({
  name: String,
  birthday: Date,
  // using an already defined schema in another schema's property
  address: {
    type: AddressSchema,
    required: false
  }
})

const user = UserSchema.parse({
  name: 'Martin',
  birthday: '6/11/1983'
})

t.truthy(user)

const error1 = t.throws(() => UserSchema.parse({
  name: 'Martin',
  birthday: '6/11/1983',
  address: null
}))

t.is(error1.errors[0].message, 'Property address.line1 is required')
t.is(error1.errors[0].field.fullPath, 'address.line1')

const error2 = t.throws(() => UserSchema.parse({
  name: 'Martin',
  birthday: '6/11/1983',
  address: {
    zip: 33129
  }
}))

t.is(error2.errors[0].message, 'Property address.line1 is required')
t.is(error2.errors[0].field.fullPath, 'address.line1')

t.deepEqual(UserSchema.paths, ['name', 'birthday', 'address.line1', 'address.line2', 'address.zip'])

t.notThrows(() => UserSchema.parse({
  name: 'Martin',
  birthday: '6/11/1983',
  address: {
    line1: 'Brickell Ave',
    zip: 33129
  }
}))
```

## Initial settings

```js
const SomeSchema = new Schema({
  name: String
})

const error1 = t.throws(() => SomeSchema.parse(undefined))
t.is(error1.message, `Data is not valid`)
t.is(error1.errors[0].message, `Property name is required`)
```

We can override the initial settings of our schema

```js
const SomeOptionalSchema = new Schema({
    name: String
  },
  {
    settings: {
      required: false
    }
  })

t.notThrows(() => SomeOptionalSchema.parse(undefined))
const error2 = t.throws(() => SomeOptionalSchema.parse({}))
t.is(error2.message, `Data is not valid`)
t.is(error2.errors[0].message, `Property name is required`)
```

## Multiple types

```js
const UserSchema = new Schema({
  picture: [Function, Promise]
})

t.notThrows(() => UserSchema.parse({ picture () {} }))
t.notThrows(() => UserSchema.parse({ picture: new Promise(resolve => resolve(`this`)) }))

const error = t.throws(() => UserSchema.parse({ picture: `some pic` }))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Could not resolve given value type`)
t.is(error.errors[0].field.fullPath, `picture`)
```


## Life-cycle

- [Schema.parse](/DOCS.md#Schema+parse)
  - parses [loaders](#Loaders) (if any given in the [SchemaSetting](/DOCS.md#Schema..SchemaSettings))
  - apply specified [transformer](/DOCS.md#Transformers)
  - runs [cast](/DOCS.md#Caster) hook
  - runs [validate](/DOCS.md#Validator) hook
  - runs [parse](/DOCS.md#Parser) hook 

## Transformers

Transformers have their own section. See [TRANSFORMERS.md](./TRANSFORMERS.md)

## Hooks

Hooks extend the schema functionality by allowing to compute custom logic
during different points of the parsing lifecycle.

### property cast



The [cast](/DOCS.md#Caster) hook can be use within a [SchemaSetting](/DOCS.md#Schema..SchemaSettings) to provide
extra casting logic.

```js
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
```

### property validate



The [validate](/DOCS.md#Caster) hook can be use within a [SchemaSetting](/DOCS.md#Schema..SchemaSettings) to provide
extra validation logic.

```js
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
```

### schema cast

```js
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
```

### schema validate

```js
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
```

## Loaders



Loaders can be seen as a way of piping transformers.

```js
const User = new Schema({
  id: {
    type: String,
    loaders: [Number],
    cast (aNumber) {
      return `#${ aNumber }`
    }
  },
  name: String
})

const error = t.throws(() => User.parse({
  id: '123',
  name: 'Kombucha'
}))
t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid number')

let product
t.notThrows(() => {
  product = User.parse({
    id: 123,
    name: 'Kombucha'
  })
})
t.truthy(product)
t.is(product.id, '#123')
```

* * *

### License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>

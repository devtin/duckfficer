# schema-validator
![](https://img.shields.io/badge/coverage-92%25-green)
![](https://github.com/devtin/schema-validator/workflows/tests/badge.svg)
[![MIT license](http://img.shields.io/badge/License-MIT-brightgreen.svg)](http://opensource.org/licenses)

Zero-dependencies, light-weight library for validating & sanitizing JavaScript data schemas.  

- [About](#about)
- [Installation](#installation)
- [At-a-glance](#at-a-glance)
- [Guide](#guide)
  - [Creating a schema](#creating-a-schema)
  - [Validating arbitrary objects](#validating-arbitrary-objects)
  - [Required properties](#required-properties)
  - [Optional properties](#optional-properties)
  - [Default values](#default-values)
  - [Auto-casting](#auto-casting)
  - [Transformers](#transformers)
    - [Array](#array)
    - [Boolean](#boolean)
    - [Function](#function)
    - [Number](#number)
    - [Object](#object)
    - [Set](#set)
    - [String](#string)
    - [Custom](#custom)
  - [Hooks](#hooks)
  - [Loaders](#loaders)
- [License](#license) (MIT)

## About

One day I got tired of performing duck-type validation as I shared entity-data across different endpoints of my beloved
JavaScript ecosystem. This library is initially inspired in [mongoose](https://mongoosejs.com)'s validation syntax. 

## Installation

```sh
$ npm install @devtin/schema-validator
# or
$ yarn add @devtin/schema-validator
```

## At-a-glance

```js
const { Schema } = require('@devtin/schema-validator')

// defining the schema
const User = new Schema({
  name: String,
  address: {
    state: {
      type: String,
      default: 'Florida'
    },
    zip: Number,
    street: String
  },
  created: {
    type: Date,
    default: Date.now
  }
})

const Martin = User.parse({
  name: 'Martin',
  address: {
    zip: 33129,
    street: 'Brickell Av'
  }
})

console.log(Martin.hasOwnProperty('name')) // => true
console.log(Martin.hasOwnProperty('address')) // => true
console.log(Martin.hasOwnProperty('created')) // => true
console.log(Martin.name) // => Martin
console.log(Martin.address.state) // => Florida
console.log(Martin.address.zip) // => 33129
console.log(Martin.address.street) // => Brickell Av
console.log(Martin.created instanceof Date) // => true

try {
  User.parse({
    name: 'Martin Rafael Gonzalez'
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(err.errors.length) // => 2
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => Property address.zip is required
  console.log(err.errors[0].field.fullPath) // => address.zip
  console.log(err.errors[1].message) // => Property address.street is required
  console.log(err.errors[1].field.fullPath) // => address.street
}

```

I would suggest having a look at [the guide](#guide) and [the docs](./DOCS.md) respectively.  
Maybe also playing with this [codepen](https://codepen.io/tin_r/pen/VwYbego) for a quick overview.

## Guide

All features showcased above in this guide are taken straight from some of the tests performed in the [test](test)
directory. Mind tests are performed using <a href="https://github.com/avajs/ava" target="_blank">AVA</a>. I think the
syntax is pretty self-explanatory but in case you find yourself lost reading the examples below, maybe having a look at
the <a href="https://github.com/avajs/ava" target="_blank">AVA</a> syntax may help you get quickly on track. 

- [Creating a schema](#creating-a-schema)
- [Validating arbitrary objects](#validating-arbitrary-objects)
- [Required properties](#required-properties)
- [Optional properties](#optional-properties)
- [Default values](#default-values)
- [Auto-casting](#auto-casting)

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
[Schema](./DOCS.md#Schema) class docs for more information.

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

A default value could also be a function. Refer to the [SchemaSettings](./DOCS.md#schemaschemasettings--object) docs
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

## Transformers

Transformers are the ones validating, casting and parsing all property-types defined in the schema.

- [Array](#array)
- [Boolean](#boolean)
- [Function](#function)
- [Number](#number)
- [Object](#object)
- [Set](#set)
- [String](#string)
- [Custom](#custom)

## Array



Initializes `Array` types

```js
const ProductType = new Schema({
  name: String,
  category: Array
})

const product = ProductType.parse({
  name: 'Kombucha',
  category: ['Beverages', 'Tea', 'Health']
})

t.true(Array.isArray(product.category))
t.is(product.category.length, 3)
t.is(product.category[1], 'Tea')
```

Given an invalid `Array` it will throw a `ValidationError`

```js
const error = t.throws(() => ProductType.parse({
  name: 'Kombucha',
  category: 'none' // < not an array
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, 'Invalid array')
t.is(error.errors[0].field.fullPath, 'category')
```

### arraySchema



The Array transformer can initialize the items in the array by passing them through the transformer specified in
the `arraySchema` setting.

```js
const Log = new Schema({
  user: String,
  lastAccess: {
    type: Array,
    arraySchema: {
      type: Date,
      autoCast: true
    }
  }
})

const tinLog = Log.parse({
  user: 'tin',
  lastAccess: ['6/11/2019', 'Sat Jan 11 2020 17:06:31 GMT-0500 (Eastern Standard Time)']
})

t.true(Array.isArray(tinLog.lastAccess))
t.is(tinLog.lastAccess.length, 2)
t.true(tinLog.lastAccess[0] instanceof Date)
t.true(tinLog.lastAccess[1] instanceof Date)

const error = t.throws(() => Log.parse({
  user: 'tin',
  lastAccess: ['6/11/1983', 'What is love?']
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, 'Invalid date')
t.is(error.errors[0].field.fullPath, 'lastAccess.1')
```
## Boolean



Validates `Boolean`s.

```js
const ProductSchema = new Schema({
  name: String,
  active: {
    type: Boolean,
    default: false,
  }
})

const error = t.throws(() => ProductSchema.parse({
  name: 'Kombucha',
  active: 'no'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid boolean')

let product1
t.notThrows(() => {
  product1 = ProductSchema.parse({
    name: 'Kombucha',
    active: true
  })
})

t.truthy(product1)
t.true(product1.active)

let product2
t.notThrows(() => {
  product2 = ProductSchema.parse({
    name: 'tin'
  })
})

t.truthy(product2)
t.false(product2.active)
```

### autoCast (default `false`)



`Boolean`'s have a built-in auto-casting function that would transform any truthy value into `true`,
falsy values into `false`, when enabled. This setting is `false` by default.

```js
const ProductType = new Schema({
  name: String,
  active: {
    type: Boolean,
    default: false,
    autoCast: true // has to be enabled
  }
})

let product
t.notThrows(() => {
  product = ProductType.parse({
    name: 'Kombucha',
    active: 'sure!'
  })
})

t.true(product.active)
```
## Function

```js
const ProductType = new Schema({
  user: String,
  save: Function
})

let product = ProductType.parse({
  user: 'tin',
  save () {
    return 'yeah!'
  }
})

t.true(typeof product.save === 'function')
t.is(product.save(), 'yeah!')

const error = t.throws(() => ProductType.parse({
  user: 'tin',
  save: false
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors.length, 1)
t.is(error.errors[0].message, 'Invalid function')
```
## Number



Validates `Number`s.

```js
const ProductType = new Schema({
  user: String,
  age: Number
})

const error = t.throws(() => ProductType.parse({
  user: 'tin',
  age: '36'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid number')
t.is(error.errors[0].field.fullPath, 'age')

let contact
t.notThrows(() => {
  contact = ProductType.parse({
    user: 'tin',
    age: 36
  })
})

t.is(contact.user, 'tin')
t.is(contact.age, 36)
```

### autoCast (default `false`)



`Number` transformer has a built-in auto-casting function that would convert any numeric representation
`String` into a proper `Number`. This feature is disabled by default.

```js
const UserSchema = new Schema({
  user: String,
  age: Number
})

t.throws(() => UserSchema.parse({
  user: 'tin',
  age: '36'
}))
```

To enable it, just pass the setting `autoCast` equaled to `true`

```js
const UserSchema2 = new Schema({
  user: String,
  age: {
    type: Number,
    autoCast: true
  }
})

let contact
t.notThrows(() => {
  contact = UserSchema2.parse({
    user: 'tin',
    age: '36' // < numeric string
  })
})

t.is(contact.user, 'tin')
t.is(contact.age, 36)

const error = t.throws(() => UserSchema2.parse({
  user: 'tin',
  age: 'thirty six'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid number')
t.is(error.errors[0].field.fullPath, 'age')
```
## Object

```js
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
```
## Set

```js
const ProductType = new Schema({
  name: String,
  category: Set
})

const product = ProductType.parse({
  name: 'Kombucha',
  category: ['Beverages', 'Health', 'Tea', 'Health']
})

t.false(Array.isArray(product.category))
t.is(product.category.size, 3)
t.true(product.category.has('Health'))

const error = t.throws(() => ProductType.parse({
  name: 'Kombucha',
  category: 'none'
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, 'Invalid set')
t.is(error.errors[0].field.fullPath, 'category')
```

### autoCast (default `true`)

```js
const ProductType = new Schema({
  name: String,
  category: {
    type: Set,
    autoCast: false
  }
})

const product = ProductType.parse({
  name: 'Kombucha',
  category: new Set(['Beverages', 'Health', 'Tea', 'Health'])
})

t.false(Array.isArray(product.category))
t.is(product.category.size, 3)
t.true(product.category.has('Health'))

const error = t.throws(() => ProductType.parse({
  name: 'Kombucha',
  category: ['Beverages', 'Health', 'Tea', 'Health']
}))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, 'Invalid set')
t.is(error.errors[0].field.fullPath, 'category')
```
## String



Validates `String`'s.

```js
const stringSchema = new Schema({
  name: String
})

const error = t.throws(() => stringSchema.parse({ name: 123 }))
t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid string')
t.is(error.errors[0].field.fullPath, 'name')
```

### minlength



Setting `minlength` validates given `String` has a minimum length.

```js
const nameSchema = new Schema({
  name: {
    type: String,
    minlength: 6
    // minlength: [6, 'Looking for a custom error message?']
  }
})

const error = t.throws(() => nameSchema.parse({ name: 'Tin' }))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Invalid minlength`)
// t.is(error.errors[0].message, `Looking for a custom error message?`)
t.is(error.errors[0].field.fullPath, `name`)

t.notThrows(() => nameSchema.parse({ name: 'Martin' }), `Martin`)
```

### maxlength



Setting `maxlength` validates given `String` has a maximum length of...

```js
const lastNameSchema = new Schema({
  lastName: {
    type: String,
    maxlength: 13
    // maxlength: [13, 'Looking for a custom error message?']
  }
})

const error = t.throws(() => lastNameSchema.parse({ lastName: 'Schwarzenegger' }))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Invalid maxlength`)
// t.is(error.errors[0].message, `Looking for a custom error message?`)

t.notThrows(() => lastNameSchema.parse({ lastName: 'Gonzalez' }))
```

### regex



Setting `regex` provides a validation via regular expression against given values.

```js
const nameSchema = new Schema({
  name: {
    type: String,
    regex: /^[a-z]+$/i
  }
})

const error = t.throws(() => nameSchema.parse({ name: 'Tin Rafael' }))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Invalid regex`)

t.notThrows(() => nameSchema.parse({ name: 'Martin' }))
```

Custom error

```js
const nameSchema2 = new Schema({
  name: {
    type: String,
    regex: [/^[a-z]+$/i, 'lowercase only']
  }
})

const error2 = t.throws(() => nameSchema2.parse({ name: 'Tin Rafael' }))
t.is(error2.message, `Data is not valid`)
t.is(error2.errors[0].message, `lowercase only`)
```
## Custom



Custom transformers are great to implement custom logic that may be required by multiple entities of the ecosystem.

```js
const customTransformer = new Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: 'Email',
    onlyGmail: true
  },
})

let error = t.throws(() => customTransformer.parse({
  name: 'Martin',
  email: 'tin@devtin.io'
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Don't know how to resolve Email`)
```

Creating a custom transformer is as simple as appending the logic into the Transformers object
found in `const { Transformers } = require('@devtin/schema-validator')`.

Have a look at the [Transformer](DOCS.md#Transformer) object in the docs.

```js
Transformers.Email = {
  loaders: [
    {
      type: String,
      regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, `Invalid e-mail address { value } for field { field.name }`]
    }
  ], // pre-processes the value using this known-registered types
  validate (v) {
    t.true(this instanceof Schema)
    if (this.settings.onlyGmail && !/@gmail\.com$/.test(v)) {
      return this.throwError(`Only gmail accounts`)
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
```

## Hooks

Hooks spread the schema functionality by allowing to compute custom logic
during different points of the parsing lifecycle.

todo

## Loaders

Loaders could be seen as a transformer extending other transformer's functionality.

todo

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>

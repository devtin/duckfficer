# schema-validator
![](https://img.shields.io/badge/coverage-95%25-green)
![](https://github.com/devtin/schema-validator/workflows/tests/badge.svg)
[![MIT license](http://img.shields.io/badge/License-MIT-brightgreen.svg)](http://opensource.org/licenses)

Zero-dependencies, light-weight library for validating & sanitizing JavaScript data schemas.  

- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [License](#license) (MIT)

### About

In my beloved JavaScript ecosystem, I'm constantly defining data schemas just to find myself later performing duck-type
validation and casting values to ensure data-type consistency prior proceeding with further business logic...
One day I got tired and found some inspiration on the [mongoose](https://mongoosejs.com)'s validation syntax.

### Installation

```sh
$ npm install @devtin/schema-validator
# or
$ yarn add @devtin/schema-validator
```

### Usage

```js
const { Schema } = require('@devtin/schema-validator')

// defining the schema
const User = new Schema({
  name: String,
  email: {
    type: String,
    regex: [/^[a-z0-9.]+@[a-z0-9.]+\.[a-z]{2,}$/, `Invalid e-mail address`]
  },
  created: {
    type: Date,
    default: Date.now
  }
})

const Martin = User.parse({
  name: 'Martin',
  email: 'tin@devtin.io'
})

console.log(Martin.hasOwnProperty('name')) // => true
console.log(Martin.hasOwnProperty('email')) // => true
console.log(Martin.hasOwnProperty('created')) // => true
console.log(Martin.name) // => Martin
console.log(Martin.email) // => tin@devtin.io
console.log(Martin.created instanceof Date) // => true

try {
  User.parse({
    name: 'Martin Rafael Gonzalez',
    email: 'none'
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(err.errors.length) // => 1
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => Invalid e-mail address
  console.log(err.errors[0].field.name) // => email
}

```

Have a look at [the docs](./DOCS.md)  
Also have a look at this [codepen](https://codepen.io/tin_r/pen/VwYbego) playground.  

### Guide

All features showcased above in this guide are taken straight from the [test/features](test/features) directory.
Mind tests are performed using <a href="https://github.com/avajs/ava" target="_blank">AVA</a>. I think the syntax is
pretty self-explanatory but in case you find yourself lost reading the examples below, maybe having a look at the
<a href="https://github.com/avajs/ava" target="_blank">AVA</a> syntax may help you get quickly on track. 

**Index**  
- [Creating a schema](#creating-a-schema)
- [Validating arbitrary objects](#validating-arbitrary-objects)
- [Required properties](#required-properties)
- [Optional properties](#optional-properties)
- [Default values](#default-values)
- [Auto-casting](#auto-casting)

### Creating a schema



In order to check the data integrity of an object, I'm gonna create a schema defining the expected
structure of my desired object.

```js
const UserSchema = new Schema({
  name: String,
  birthday: Date,
  description: Array
})
```

My created schema is ready to parse arbitrary objects.

```js
const arbitraryObject = {
  name: `Martin Rafael Gonzalez`,
  birthday: '6/11/1983',
  description: ['monkey', 'developer', 'arepa lover']
}

const Martin = UserSchema.parse(arbitraryObject)
```

I can now use the returned sanitized-object carelessly since I just ensured it will match my expected schema.

```js
t.is(Martin.name, `Martin Rafael Gonzalez`)
t.true(Martin.birthday instanceof Date)
t.is(Martin.birthday.getFullYear(), 1983)
t.is(Martin.description.length, 3)
```

### Validating arbitrary objects



I'll continue using the `UserSchema` example to validate arbitrary objects.

```js
const UserSchema = new Schema({
  name: String,
  birthday: Date,
  description: Array
})
```

Think of an *arbitrary object* as one that could have been inputted and send through an HTML form,
retrieved from a POST request; or maybe inputted from a terminal application. An error will be thrown given an
arbitrary object not matching the defined schema.

```js
const arbitraryObject = {
  firstName: 'Martin',
  middleName: 'Rafael',
  lastName: 'Gonzalez',
  birthday: `6/11/1983`,
  description: ['monkey', 'developer', 'arepa lover']
}
```

Given object contains fields that does not exists in our schema (`firstName`, `middleName` and `lastName`),
following validation will result in an error since the arbitrary object contains 3 unknown properties, plus the
property `name` (expected by the schema) is also missing.

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

### Required properties



A schema defines the structure and data-type expected by an arbitrary object.
All properties are required by default.

```js
const ProductSchema = new Schema({
  name: String,
  stock: Number,
  category: Array
})
```

Whenever a required property is missing, an error will be thrown.

```js
let error = t.throws(() => ProductSchema.parse({
  name: 'Kombucha',
  stock: 11
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors.length, 1)
t.is(error.errors[0].message, `Property category is required`)
```

### Optional properties



In the example below I'm gonna create a schema with an optional property called `age`.
In order to do so I'm gonna set the property setting `required` to `false`.

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

I can now validate arbitrary objects missing the property `age` as long as they match other required properties.

```js
let contact
t.notThrows(() => {
  contact = ContactSchema.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  })
})
```

Whenever `age` is present, the validation will ensure it is a `Number`.

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

### Default values



Default values are meant to be assigned to a property when absent.

```js
const ContactSchema = new Schema({
  name: String,
  country: {
    type: String,
    default: 'United States'
  }
})
```

When a property is assigned with a default value, it will be treated as `{ required: false }`.

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

A default value could also be a function. Refer to the [docs](DOCS.md) for more information.

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

### Auto-casting



Most transformers provide an option for auto-casting. When `autoCast=true` (depending on the transformer) it may
try to resolve given arbitrary value into the expected one.
 *
For example, the `Date` transformer will try to auto-cast `String`'s into a proper `Date`, if possible.
The `Number` transformer as well: will try to resolve those `String`'s that look like a number and convert them into
a proper `Number.

```js
const UserSchema = new Schema({
  name: String,
  birthday: Date,
  kids: Number
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

Now, depending on how strictly we need to perform our validations, sometimes we may require to turn this
feature off.

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

* * *

### License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>

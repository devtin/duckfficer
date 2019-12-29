# schema-validator
[![MIT license](http://img.shields.io/badge/License-MIT-brightgreen.svg)](http://opensource.org/licenses)
![](https://github.com/devtin/schema-validator/workflows/tests/badge.svg)

Zero-dependencies, light-weight library for validating & sanitizing javascript's data schemas.  

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

Have a look at this [codepen](https://codepen.io/tin_r/pen/VwYbego) playground.

```js
const { Schema } = require('@devtin/schema-validator')

// defining the schema
const User = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: [true, 'An e-mail must be entered'],
    regex: [/^[a-z0-9._+]+@[a-z0-9-]+\.[a-z]{2,}$/, 'Please enter a valid e-mail']
  },
  birthday: Date,
  created: {
    type: Date,
    default: Date.now
  }
})

const Martin = User.parse({
  name: 'Martin',
  email: 'tin@devtin.io',
  birthday: '6/11/1983'
})

console.log(Martin.hasOwnProperty('name')) // => true
console.log(Martin.hasOwnProperty('email')) // => true
console.log(Martin.birthday instanceof Date) // => true
console.log(Martin.hasOwnProperty('created')) // => true
console.log(Martin.created instanceof Date) // => true

try {
  User.parse({
    name: 'Olivia',
    birthday: '8/31/2019'
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(err.errors.length) // => 1
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => An e-mail must be entered
  console.log(err.errors[0].field.name) // => email
}

```

Have a look at [the docs](./DOCS.md)

### Features

- [Schema validator validates value type in a Schema](#schema-validator-validates-value-type-in-a-schema)
- [Minlength helper for strings](#minlength-helper-for-strings)
- [Maxlength helper for strings](#maxlength-helper-for-strings)
- [Regex helper for strings](#regex-helper-for-strings)
- [Default value helper](#default-value-helper)
- [Default value helper function](#default-value-helper-function)
- [Custom error messages with optional rendering](#custom-error-messages-with-optional-rendering)
- [Type casting](#type-casting)
- [Validates an object schema in terms of contained properties](#validates-an-object-schema-in-terms-of-contained-properties)
- [Validates and sanitizes schemas](#validates-and-sanitizes-schemas)
- [Validates full nested schemas](#validates-full-nested-schemas)
- [Handles custom data-types](#handles-custom-data-types)

### Schema validator validates value type in a Schema

```js
const firstNameValidator = new Schema({
  name: 'firstName',
  type: String
})

t.throws(() => firstNameValidator.parse(1), 'Invalid string')
t.throws(() => firstNameValidator.parse({ name: 'Martin' }), 'Invalid string')
t.throws(() => firstNameValidator.parse(() => 'Martin'), 'Invalid string')
t.notThrows(() => firstNameValidator.parse('Martin'), 'Martin')
```

### Minlength helper for strings

```js
const firstNameValidator = new Schema({
  name: 'firstName',
  type: String,
  minlength: 6
})

t.throws(() => firstNameValidator.parse('Tin'), `Invalid minlength`)
t.notThrows(() => firstNameValidator.parse('Martin'), `Martin`)
```

### Maxlength helper for strings

```js
const firstNameValidator = new Schema({
  name: 'firstName',
  type: String,
  maxlength: 13
})

t.throws(() => firstNameValidator.parse('Schwarzenegger'), `Invalid maxlength`)
t.notThrows(() => firstNameValidator.parse('Martin'), `Martin`)
```

### Regex helper for strings

```js
const firstNameValidator = new Schema({
  name: 'firstName',
  type: String,
  regex: /^[a-z]+$/i
})

t.throws(() => firstNameValidator.parse('Tin Rafael'), `Invalid regex`)
t.notThrows(() => firstNameValidator.parse('Martin'))
```

### Default value helper

```js
const quantityValidator = new Schema({
  name: 'quantity',
  type: Number,
  default: 1
})

t.is(quantityValidator.parse(), 1)
```

### Default value helper function

```js
const quantityValidator = new Schema({
  name: 'date',
  type: Date,
  default: Date.now
})

t.notThrows(() => quantityValidator.parse())
t.is(Math.round(quantityValidator.parse().getTime() / 100), Math.round(Date.now() / 100))
```

### Custom error messages with optional rendering

```js
const Title = new Schema({
  name: 'title',
  type: String,
  required: [true, 'A post requires a title']
})

t.throws(() => Title.parse(), 'A post requires a title')

const Email = new Schema({
  name: 'title',
  type: String,
  regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, '{ value } is not a valid e-mail address']
})

t.throws(() => Email.parse('martin'), 'martin is not a valid e-mail address')
```

### Type casting

```js
const DOB = new Schema({
  name: 'title',
  type: Date
})

t.true(DOB.parse('6/11/1983') instanceof Date)

const qtty = new Schema({
  name: 'quantity',
  type: Number
})

t.true(Number.isInteger(qtty.parse('20')))
```

### Validates an object schema in terms of contained properties

```js
const user = {
  name: 'Martin Rafael',
  email: 'tin@devtin.io',
  address: {
    city: 'Miami, Fl',
    zip: 33129,
    line1: 'Brickell Ave'
  }
}

t.false(Utils.propertiesRestricted(user, ['name'])) // => false
t.true(Utils.propertiesRestricted(user, ['name', 'email', 'address'])) // => true
t.true(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'])) // => true
t.false(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'], { strict: true })) // => false
```

### Validates and sanitizes schemas

```js
const PostValidator = new Schema({
  title: {
    type: String,
    required: [true, 'A post requires a title']
  },
  body: {
    type: String,
    required: true
  },
  published: {
    type: Date,
    default: Date.now
  }
})

t.throws(() => PostValidator.parse({
  title: 'Beware while selling your stuffs online',
  body: 'Do never share your phone number',
  category: 'shopping'
}), `Invalid object schema`) // since there is no `category` field in the schema

let post
t.notThrows(() => {
  post = PostValidator.parse({
    title: 'Beware while selling your stuffs online',
    body: 'Do never share your phone number'
  })
})

t.truthy(post)
t.true(post.hasOwnProperty('title'))
t.true(post.hasOwnProperty('body'))
t.true(post.hasOwnProperty('published'))
t.true(typeof post.title === 'string')
t.true(typeof post.body === 'string')
t.true(post.published instanceof Date)
```

### Validates full nested schemas

```js
// console.log(`AddressValidator.paths`, AddressValidator.paths)
const UserValidator = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    regex: /^[a-z0-9_.]+@[a-z-0-9.]+\.[a-z]{2,}$/
  },
  birthday: {
    type: Date,
    validate ({ value }) {
      const millenials = new Date('1/1/2000').getTime()
      if (value.getTime() >= millenials) {
        throw new Error(`Sorry. No millennials allowed!`)
      }
    }
  },
  address: {
    city: {
      type: String,
      required: true
    },
    zip: {
      type: Number,
      required: true
    },
    line1: {
      type: String,
      required: true
    },
    line2: String
  }
})

const err = t.throws(() => UserValidator.parse({
  name: 'Martin',
  email: 'marting.dc@gmail.com',
}), 'Data is not valid')

t.is(err.errors.length, 3)
t.is(err.errors[0].message, 'Field address.city is required')
t.is(err.errors[1].message, 'Field address.zip is required')
t.is(err.errors[2].message, 'Field address.line1 is required')

t.notThrows(() => UserValidator.parse({
  name: 'Martin',
  email: 'marting.dc@gmail.com',
  birthday: '6/11/1983',
  address: {
    city: 'Miami',
    zip: 33129,
    line1: '2451 Brickell Ave'
  }
}))
```

### Handles custom data-types

```js
const customType = new Schema({
  name: String,
  email: {
    type: 'Email',
    required: true
  },
})

let error = t.throws(() => customType.parse({
  name: 'Martin',
  email: 'tin@devtin.io'
}), `Data is not valid`)
t.is(error.errors[0].message, `Don't know how to resolve Email`)

// Registers a new custom type
Transformers.Email = {
  loaders: [String], // pre-processes the value using this known-registered types
  parse (v) {
    if (!/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/.test(v)) {
      return this.throwError(`Invalid e-mail address { value } for field { field.name }`, { value: v })
    }
    return v
  }
}

error = t.throws(() => customType.parse({
  name: 'Martin',
  email: 123
}), 'Data is not valid')

t.is(error.errors[0].message, 'Invalid string')

error = t.throws(() => customType.parse({
  name: 'Martin',
  email: 'martin'
}), 'Data is not valid')

t.is(error.errors[0].message, 'Invalid e-mail address martin for field email')

t.notThrows(() => customType.parse({
  name: 'Martin',
  email: 'tin@devtin.io'
}))
```

* * *

### License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019 Martin Rafael <tin@devtin.io>

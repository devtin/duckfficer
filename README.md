<p align="center"><img align="center" width="480" src="https://repository-images.githubusercontent.com/228456718/f4767e00-61e6-11ea-964a-7b02d8dcb48f"/></p><br/>
<p align="center">
<a href="https://www.npmjs.com/package/@devtin/schema-validator" target="_blank"><img src="https://img.shields.io/npm/v/@devtin/schema-validator.svg" alt="Version"></a>
<a href="https://htmlpreview.github.io/?https://github.com/devtin/schema-validator/blob/master/coverage/lcov-report/index.html"><img src="https://img.shields.io/badge/coverage-99%25-green" alt="Coverage 99%"></a>
<a href="/test/features"><img src="https://github.com/devtin/schema-validator/workflows/tests/badge.svg"></a>
<a href="http://opensource.org/licenses" target="_blank"><img src="http://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
</p>

# @devtin/schema-validator
Zero-dependencies, light-weight library (~3KB minified + gzipped) for validating & sanitizing JavaScript data schemas.  

- [About](#about)
- [Installation](#installation)
- [At-a-glance](#at-a-glance)
- [Advanced Usage](#advanced-usage)
- [Guide](./guide/README.md)
- [Documentation](/DOCS.md)
- [License](#license) (MIT)

## About

Tired of performing duck-type validation while sharing data-schema across different endpoints of my beloved
JavaScript ecosystem, I took some inspiration from the [mongoose](https://mongoosejs.com)'s validation syntax and created
this light-weight library (~3KB minified + gzipped) for validating & sanitizing JavaScript data schemas.

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
  email: {
    type: String,
    regex: [/[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}/, `'{ value }' is not a valid e-mail address`]
  },
  created: {
    type: Date,
    default: Date.now
  }
})

const Martin = User.parse({
  name: 'Martin Rafael',
  email: 'tin@devtin.io'
})

console.log(Martin.name) // => Martin Rafael
console.log(Martin.email) // => tin@devtin.io
console.log(Martin.created instanceof Date) // => true

try {
  User.parse({
    name: 'Sandy Papo',
    email: '@huelepega'
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(err.errors.length) // => 1
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => '@huelepega' is not a valid e-mail address
  console.log(err.errors[0].field.fullPath) // => email
}

```

## Advanced Usage

```js
const { Schema, Transformers } = require('@devtin/schema-validator')

// defining the schema
const User = new Schema({
  id: 'UserId',
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

const UUIDPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/
Transformers.UserId = {
  settings: {
    loaders: [{
      type: String,
      regex: [UUIDPattern, `{ value } is not a valid UUID`]
    }],
    required: false,
    default () {
      // GUID / UUID RFC4122 version 4 taken from: https://stackoverflow.com/a/2117523/1064165
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }
}

const Martin = User.parse({
  name: 'Martin',
  address: {
    zip: 33129,
    street: 'Brickell Av'
  }
})

console.log(Martin.hasOwnProperty('id')) // => true
console.log(Martin.hasOwnProperty('name')) // => true
console.log(Martin.hasOwnProperty('address')) // => true
console.log(Martin.hasOwnProperty('created')) // => true
console.log(UUIDPattern.test(Martin.id)) // => true
console.log(Martin.name) // => Martin
console.log(Martin.address.state) // => Florida
console.log(Martin.address.zip) // => 33129
console.log(Martin.address.street) // => Brickell Av
console.log(Martin.created instanceof Date) // => true

try {
  User.parse({
    id: '123',
    name: 'Martin Rafael Gonzalez'
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(err.errors.length) // => 2
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => 123 is not a valid UUID
  console.log(err.errors[0].field.fullPath) // => id
  console.log(err.errors[1].message) // => Property address.zip is required
  console.log(err.errors[1].field.fullPath) // => address.zip
  console.log(err.errors[2].message) // => Property address.street is required
  console.log(err.errors[2].field.fullPath) // => address.street
}

```


## Further reading

I would suggest having a look at the [guide](./guide/README.md) for advanced usage and at the [js-docs](./DOCS.md)
respectively.  

Playing with this <a href="https://codepen.io/tin_r/pen/PoqwLMb" target="_blank">codepen</a> may also be helpful for a
quick overview.

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>

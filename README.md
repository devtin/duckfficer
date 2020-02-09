# schema-validator
![](https://img.shields.io/badge/coverage-94%25-green)
![](https://github.com/devtin/schema-validator/workflows/tests/badge.svg)
[![MIT license](http://img.shields.io/badge/License-MIT-brightgreen.svg)](http://opensource.org/licenses)

Zero-dependencies, light-weight library (~2.5KB gzipped) for validating & sanitizing JavaScript data schemas.  

- [About](#about)
- [Installation](#installation)
- [At-a-glance](#at-a-glance)
- [Guide](./guide)
- [Documentation](/DOCS.md)
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

I would suggest having a look at the [guide](./guide/README.md) and the [documentation](./DOCS.md) respectively.  
Maybe also playing with this <a href="https://codepen.io/tin_r/pen/PoqwLMb" target="_blank">codepen</a> for a quick overview.

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>

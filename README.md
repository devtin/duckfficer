<p align="center"><img align="center" width="480" src="https://repository-images.githubusercontent.com/228456718/f4767e00-61e6-11ea-964a-7b02d8dcb48f"/></p>

<div align="center"><h1 align="center">@devtin/schema-validator</h1></div>

<p align="center">
<a href="https://www.npmjs.com/package/@devtin/schema-validator" target="_blank"><img src="https://img.shields.io/npm/v/@devtin/schema-validator.svg" alt="Version"></a>
<a href="https://htmlpreview.github.io/?https://github.com/devtin/schema-validator/blob/master/coverage/lcov-report/index.html"><img src="https://img.shields.io/badge/coverage-99%25-green" alt="Coverage 99%"></a>
<a href="/test/features"><img src="https://github.com/devtin/schema-validator/workflows/test/badge.svg"></a>
<a href="http://opensource.org/licenses" target="_blank"><img src="http://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
</p>

<p align="center">
Zero-dependencies, light-weight library (~3KB minified + gzipped)<br>
for validating & sanitizing JavaScript data schemas.
</p>  

## Content

- [About](#about)
- [Installation](#installation)
- [At-a-glance](#at-a-glance)
- [Guide](./guide/README.md)
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
  - [Hooks](/guide/README.md#hooks)
  - [Loaders](/guide/README.md#loaders)
- [JS-Docs](/DOCS.md)
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


## Further reading

I would suggest having a look at the [guide](./guide/README.md) for advanced usage and at the [js-docs](./DOCS.md)
respectively.  

Playing with this <a href="https://codepen.io/tin_r/pen/PoqwLMb" target="_blank">codepen</a> may also be helpful for a
quick overview.

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>

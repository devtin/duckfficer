<p align="center"><img align="center" width="480" src="https://repository-images.githubusercontent.com/228456718/f4767e00-61e6-11ea-964a-7b02d8dcb48f"/></p>

<div align="center"><h1 align="center">@devtin/schema-validator</h1></div>

<p align="center">
<a href="https://www.npmjs.com/package/@devtin/schema-validator" target="_blank"><img src="https://img.shields.io/npm/v/@devtin/schema-validator.svg" alt="Version"></a>
<a href="https://htmlpreview.github.io/?https://github.com/devtin/schema-validator/blob/master/coverage/lcov-report/index.html"><img src="https://img.shields.io/badge/coverage-99%25-green" alt="Coverage 99%"></a>
<a href="/test/features"><img src="https://github.com/devtin/schema-validator/workflows/test/badge.svg"></a>
<a href="https://gitter.im/schema-validator/community"><img src="https://badges.gitter.im/schema-validator/community.svg"></a>
<a href="http://opensource.org/licenses" target="_blank"><img src="http://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
</p>

<p align="center">
Zero-dependencies, light-weight library (~4KB minified + gzipped)<br>
for validating & sanitizing JavaScript data schemas.
</p>

## Installation

```sh
$ npm i @devtin/schema-validator
# or
$ yarn add @devtin/schema-validator
```

## About

Tired of performing duck-type validation while sharing data-schema across different endpoints of my beloved
JavaScript ecosystem, I took some inspiration from the [mongoose](https://mongoosejs.com)'s validation syntax and created
this light-weight library (~4KB minified + gzipped) for validating & sanitizing JavaScript data schemas.

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

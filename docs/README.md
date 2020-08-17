<p align="center"><img align="center" width="480" src="https://repository-images.githubusercontent.com/228456718/f4767e00-61e6-11ea-964a-7b02d8dcb48f"/></p>

<div align="center"><h1 align="center">duckfficer</h1></div>

<p align="center">
<a href="https://www.npmjs.com/package/duckfficer" target="_blank"><img src="https://img.shields.io/npm/v/duckfficer.svg" alt="Version"></a>
<a href="https://htmlpreview.github.io/?https://github.com/devtin/duckfficer/blob/master/coverage/lcov-report/index.html"><img src="https://img.shields.io/badge/coverage-99%25-green" alt="Coverage 99%"></a>
<a href="/test/features"><img src="https://github.com/devtin/duckfficer/workflows/test/badge.svg"></a>
<a href="https://opensource.org/licenses" target="_blank"><img src="https://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
</p>

<p align="center">
Zero-dependencies, light-weight library (~4.3KB minified + gzipped)<br>
for modeling, validating & sanitizing data.
</p>


## Installation

```sh
$ npm i duckfficer
# or
$ yarn add duckfficer
```

## About

Validating & sanitizing data coming from untrusted sources in JavaScript could be tedious. This light-weight library 
(~4.3KB minified + gzipped) was initially built to help validate & sanitize data in a RESTFul API.

## At-a-glance

```js
const { Schema, Transformers } = require('duckfficer')
const crypto = require('crypto')

Transformers.Password = {
  loaders: [String],
  parse (pass) {
    return crypto.createHash('sha256').update(pass).digest('hex')
  }
}

// defining the schema
const User = new Schema({
  name: String,
  email: {
    type: String,
    regex: [/[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}/, '\'{ value }\' is not a valid e-mail address']
  },
  password: 'Password',
  created: {
    type: Date,
    default: Date.now
  },
  logs: {
    type: Array,
    default () {
      return []
    }
  },
  get lastLog () {
    return this.logs[this.logs.length - 1]
  }
}, {
  methods: {
    log (message) {
      this.$field.logs.push({
        date: new Date(),
        message
      })
      this.$emit('log', message)
    },
    isValidPassword (password) {
      const success = Transformers.Password.parse(password) === this.$field.password
      this.$field.log(`password ${password} ${success ? 'pass' : 'failed'} validation`)
      return success
    }
  }
})

const Martin = User.parse({
  name: 'Martin Rafael',
  email: 'tin@devtin.io',
  password: '123'
})

console.log(Martin.name) // => Martin Rafael
console.log(Martin.email) // => tin@devtin.io
console.log(Martin.password) // => a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
console.log(Martin.created instanceof Date) // => true

Martin.$on('log', console.log)

// [log event fired] => password 456 failed validation
console.log(Martin.isValidPassword('456')) // => false
// [log event fired] => password 123 pass validation
console.log(Martin.isValidPassword('123')) // => true
console.log(Martin.lastLog.message) // => password 123 pass validation

try {
  User.parse({
    name: 'Sandy Papo',
    email: '@huelepega',
    password: '123'
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

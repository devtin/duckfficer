<p align="center"><img align="center" width="480" src="https://repository-images.githubusercontent.com/228456718/f4767e00-61e6-11ea-964a-7b02d8dcb48f"/></p>

<div align="center"><h1 align="center">duckfficer</h1></div>

<p align="center">
<a href="https://www.npmjs.com/package/duckfficer" target="_blank"><img src="https://img.shields.io/npm/v/duckfficer.svg" alt="Version"></a>
<a href="https://htmlpreview.github.io/?https://github.com/devtin/duckfficer/blob/master/coverage/lcov-report/index.html"><img src="https://img.shields.io/badge/coverage-99%25-green" alt="Coverage 99%"></a>
<a href="/test/features"><img src="https://github.com/devtin/duckfficer/workflows/test/badge.svg"></a>
<a href="https://opensource.org/licenses" target="_blank"><img src="https://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
</p>

<p align="center">
Zero-dependencies, light-weight library (~4.6KB minified + gzipped)<br>
for modeling, validating & sanitizing data
</p>

## Manifesto

Performing duck-type validation and data sanitation is not what I came to this world for... I want a utility helping me
simplify that task.

This utility must:

- Check whether certain value has the shape of a predefined schema-type
- When a given value does not match the schema, it must offer a full report of what is wrong with the given
  value vs what the schema is expecting! (see: [https://duckfficer.js.org/#/guide?id=error-handling-and-lifecycle](https://duckfficer.js.org/#/guide?id=error-handling-and-lifecycle))
- Be easy to extend and share schemas within each other (see: [https://duckfficer.js.org/#/guide?id=nesting-schemas](https://duckfficer.js.org/#/guide?id=nesting-schemas))
- Provide a built-in set of types for most common usages (see: [https://duckfficer.js.org/#/types](https://duckfficer.js.org/#/types))
- Allow custom types as well as a cast and transform hooks (see: [https://duckfficer.js.org/#/types?id=custom](https://duckfficer.js.org/#/types?id=custom))


Let's put hands on it!

**Index**


## Installation

```sh
$ npm i duckfficer
# or
$ yarn add duckfficer
```

## At-a-glance

```js
const { Schema } = require('duckfficer')

// lets create a schema first
const User = new Schema({
  firstName: String,
  lastName: String,
  get fullName () {
    return this.firstName + ' ' + this.lastName
  },
  dob: Date,
  contact: {
    phoneNumber: {
      type: Number,
      autoCast: true // transforms String that look like a number into a Number
    },
    emails: {
      default () {
        return []
      },
      type: Array,
      arraySchema: {
        type: String,
        regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, '{ value } is not a valid e-mail address']
      }
    }
  }
})

User.parse({
  firstName: 'Fulano de Tal',
  contact: {
    emails: ['fulanito']
  }
})
  .catch(err => {
    console.log(err.message) // => Data is not valid
    console.log(err.errors.length) // => 4
    console.log(err.errors[0].message) // => Property lastName is required
    console.log(err.errors[0].field.fullPath) // => lastName
    console.log(err.errors[1].message) // => Property dob is required
    console.log(err.errors[1].field.fullPath) // => dob
    console.log(err.errors[2].message) // => Property contact.phoneNumber is required
    console.log(err.errors[2].field.fullPath) // => contact.phoneNumber
    console.log(err.errors[3].message) // => fulanito is not a valid e-mail address
    console.log(err.errors[3].field.fullPath) // => contact.emails.0
  })

User.parse({
  firstName: 'Fulano',
  lastName: 'de Tal',
  dob: '1/1/2020',
  contact: {
    phoneNumber: '3051234567',
    emails: [
      'personal@email.com',
      'work@email.com'
    ]
  }
})
  .then(obj => {
    console.log(obj.dob instanceof Date) // => true
    console.log(typeof obj.contact.phoneNumber) // => number
    console.log(obj) // =>
    /*
      {
        firstName: 'Fulano',
        lastName: 'de Tal',
        dob: 2020-01-01T05:00:00.000Z,
        contact: {
          phoneNumber: 3051234567,
          emails: [ 'personal@email.com', 'work@email.com' ]
        }
      }
    */
  })
```

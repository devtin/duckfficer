<p align="center"><img align="center" width="480" src="https://repository-images.githubusercontent.com/228456718/f4767e00-61e6-11ea-964a-7b02d8dcb48f"/></p>

<div align="center"><h1 align="center">duckfficer</h1></div>

<p align="center">
<a href="https://www.npmjs.com/package/duckfficer" target="_blank"><img src="https://img.shields.io/npm/v/duckfficer.svg" alt="Version"></a>
<a href="https://htmlpreview.github.io/?https://github.com/devtin/duckfficer/blob/master/coverage/lcov-report/index.html"><img src="https://img.shields.io/badge/coverage-99%25-green" alt="Coverage 99%"></a>
<a href="/test/features"><img src="https://github.com/devtin/duckfficer/workflows/test/badge.svg"></a>
<a href="https://opensource.org/licenses" target="_blank"><img src="https://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
</p>

<p align="center">
Zero-dependencies, light-weight library (~4.4KB minified + gzipped)<br>
for modeling, validating & sanitizing data
</p>

- [Installation](#installation)
- [About](#about)
- [At a glance](#at-a-glance)
- [Documentation](https://devtin.github.io/duckfficer)

## Installation

```sh
$ npm i duckfficer
# or
$ yarn add duckfficer
```

## About

Validating & sanitizing data coming from untrusted sources in JavaScript could be a tedious task. This
zero-dependencies, light-weight library (~4.4KB min+gz) was initially built as a helper for a RESTful API
environment and the browser.

## At-a-glance



*schemas/user.js*

```js
const { Schema } = require('duckfficer')

// lets create a schema first
const User = new Schema({
  firstName: String,
  lastName: String,
  get fullName () {
    return this.firstName + ' ' + this.lastName
  },
  email: {
    type: String,
    regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, '{ value } is not a valid e-mail address']
  },
  dob: Date
})

module.exports = { User }
```

*index.js*

```js
const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('koa-router')

// lets import our custom schema
const { User } = require('./schemas/user')

const app = new Koa()
const router = new Router()

app.use(koaBody())

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.body = {
      error: err.message,
      errors: err.errors
    }
  }
})

router.post('/user', async (ctx, next) => {
  const payload = await User.parse(ctx.request.body)
  console.log(payload.dob instanceof Date) // => true
  // our object is valid, we may go perform some business logic...
  ctx.body = payload
})

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000)
```

Now, start the script:

```sh
$ node index.js
```

On another terminal window:

```sh
$ curl -d "firstName=John&lastName=Doe&email=john&dob=october" http://localhost:3000/user
```
Should output:

```json
{
  "error": "Data is not valid",
  "errors": [
    {
      "message": "john is not a valid e-mail address",
      "value": "john",
      "field": "email"
    },
    {
      "message": "Invalid date",
      "value": "october",
      "field": "dob"
    }
  ]
}
```




[Read the documentation](https://devtin.github.io/duckfficer)

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>

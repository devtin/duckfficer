/**
 * *index.js*
 */
const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('koa-router')

// this is our custom schema
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

router.post('/user', (ctx, next) => {
  const payload = User.parse(ctx.request.body)
  // some business logic...
  ctx.body = payload
})

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000)

/**
 * *schemas/user.js*
 */

const { Schema } = require('duckfficer')

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

/**
 * Now, start the script:
 *
 * ```sh
 * $ node index.js
 * ```
 *
 * On another terminal window:
 *
 * ```sh
 * $ curl -d "firstName=John&lastName=Doe&email=john&dob=october" http://localhost:3000/user
 * ```
 * Should output:
 *
 * ```json
 * {
 *   "error": "Data is not valid",
 *   "errors": [
 *     {
 *       "message": "john is not a valid e-mail address",
 *       "value": "john",
 *       "field": "email"
 *     },
 *     {
 *       "message": "Invalid date",
 *       "value": "october",
 *       "field": "dob"
 *     }
 *   ]
 * }
 * ```
 */

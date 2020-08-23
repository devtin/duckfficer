const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('koa-router')

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

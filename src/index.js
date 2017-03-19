import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import config from './config'
import chiron from './chiron'

const app = new Koa()
const router = new Router({
  prefix: '/chiron/v1'
})

const bot = chiron()

router.post('/session', (ctx, next) => {
  let username
  let sessionId
  try {
    username = ctx.request.body.username
    sessionId = bot.createSession(username)
    ctx.body = bot.getSession(sessionId)
  } catch (err) {
    ctx.status = 400
    ctx.body = {
      message: 'A user name is required to create a session'
    }
  }
})

router.post('/message', (ctx, next) => {
  let sessionId = ctx.request.get('X-Chiron-Session-Id')
  try {
    ctx.body = bot.respond(sessionId, ctx.request.body.message)  
  } catch (err) {
    ctx.status = 400
    ctx.body = {
      message: err.message
    }
  }
})

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(config.server.port, () => console.log(`Application started on port ${config.server.port}`))

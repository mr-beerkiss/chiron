import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import config from './config'
import chiron from './chiron'

const app = new Koa()
const router = new Router()

const bot = chiron()

router.post('/message', (ctx, next) => {
  ctx.body = bot.respond(ctx.request.body.message)
})

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(config.server.port, () => console.log(`Application started on port ${config.server.port}`))

import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import config from './config'
import darrensBot from './darrens-bot'

const app = new Koa()
const router = new Router()

const bot = darrensBot()

router.post('/message', (ctx, next) => {
  ctx.body = bot.respond(ctx.request.body.message)
})

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(config.server.port, () => console.log(`Application started on port ${config.server.port}`))
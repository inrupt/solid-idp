import Koa from 'koa'
import { defaultConfiguration } from '../src'

async function init () {
  const idpRouter = await defaultConfiguration({
    issuer: 'https://api.swype.io'
  })
  const app = new Koa()
  app.use(idpRouter.routes())
  app.use(idpRouter.allowedMethods())
  app.listen(3000)
}
void init()

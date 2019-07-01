import Koa from 'koa'
import { defaultConfiguration } from '../src'
import { keystore } from './keystore'

const PORT = 3000

async function init () {
  const idpRouter = await defaultConfiguration({
    issuer: 'https://api.swype.io',
    pathPrefix: '/common',
    keystore
  })
  const app = new Koa()
  app.use(idpRouter.routes())
  app.use(idpRouter.allowedMethods())
  app.listen(PORT)
  console.log(`Listening on port ${PORT}`)
}
void init()

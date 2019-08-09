import Koa from 'koa'
import nodemailer from 'nodemailer'
import { defaultConfiguration } from '../src'
import { keystore } from './keystore'

const PORT = 3000

async function init () {
  // const testAccount = await nodemailer.createTestAccount()
  const idpRouter = await defaultConfiguration({
    issuer: 'https://api.swype.io',
    pathPrefix: '',
    keystore,
    mailConfiguration: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    },
    webIdFromUsername: async (username: string) => {
      return `https://${username}.api.swype.io/profile/card#me`
    },
    storagePreset: 'redis'
  })
  const app = new Koa()
  app.use(idpRouter.routes())
  app.use(idpRouter.allowedMethods())
  app.listen(PORT)
  console.log(`Listening on port ${PORT}`)
}
void init()

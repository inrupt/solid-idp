import Koa from 'koa'
import nodemailer from 'nodemailer'
import { defaultConfiguration } from '../src'
import { keystore } from './keystore'
import path from 'path'

const PORT = 3000

async function init () {
  // const testAccount = await nodemailer.createTestAccount()
  const idpRouter = await defaultConfiguration({
    issuer: 'http://localhost:8080/',
    pathPrefix: '',
    keystore,
    mailConfiguration: (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    } : undefined,
    webIdFromUsername: async (username: string) => {
      return `https://${username}.api.swype.io/profile/card#me`
    },
    onNewUser: async (username: string) => {
      return `https://${username}.api.swype.io/profile/card#me`
    },
    storagePreset: 'filesystem',
    storageData: {
      redisUrl: process.env.REDIS_URL || '',
      folder: path.join(__dirname, './.db')
    }
  })
  const app = new Koa()
  app.use(idpRouter.routes())
  app.use(idpRouter.allowedMethods())
  app.listen(PORT)
  console.log(`Listening on port ${PORT}`)
}
void init()

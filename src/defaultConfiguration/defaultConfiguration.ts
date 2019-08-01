// Modified code from https://github.com/panva/node-oidc-provider-example/blob/43436a969a7bd589fea7e8ba83caa3fd4bc61854/03-oidc-views-accounts/index.js

import path from 'path'
import Router from 'koa-router'
import views from 'koa-views'
import bodyParser from 'koa-body'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import Provider from '../core/SolidIdp'
import RedisAdapter from './redisAdapter'
import Account from './account'
import confirmInteractionHandler from './handlers/confirmInteraction.handler'
import initialInteractionHandler from './handlers/initialInteraction.handler'
import loginInteractionHandler from './handlers/loginInteraction.handler'
import forgotPasswordInteractionHandler from './handlers/forgotPasswordInteraction.handler'
import registerInteractionHandler from './handlers/registerInteraction.handler'

export interface DefaultConfigurationConfigs {
  keystore: any
  issuer: string
  pathPrefix?: string
  mailConfiguration: SMTPTransport.Options
  webIdFromUsername: (username: string) => Promise<string>
}

const handlers: ((oidc: Provider, config?: DefaultConfigurationConfigs) => Router)[] = [
  initialInteractionHandler,
  confirmInteractionHandler,
  loginInteractionHandler,
  forgotPasswordInteractionHandler,
  registerInteractionHandler
]

export default async function defaultConfiguration (config: DefaultConfigurationConfigs) {
  const pathPrefix = config.pathPrefix || ''

  const oidc = new Provider(config.issuer, {
    findById: Account.findById,
    claims: {
      openid: ['sub'],
      email: ['email', 'email_verified']
    },
    interactionUrl (ctx) {
      return `${pathPrefix}/interaction/${ctx.oidc.uuid}`
    },
    formats: {
      AccessToken: 'jwt'
    },
    features: {
      claimsParameter: true,
      devInteractions: true,
      discovery: true,
      encryption: true,
      introspection: true,
      registration: true,
      request: true,
      revocation: true,
      sessionManagement: true
    },
    routes: {
      authorization: `${pathPrefix}/auth`,
      certificates: `${pathPrefix}/certs`,
      check_session: `${pathPrefix}/session/check`,
      device_authorization: `${pathPrefix}/device/auth`,
      end_session: `${pathPrefix}/session/end`,
      introspection: `${pathPrefix}/token/introspection`,
      registration: `${pathPrefix}/reg`,
      revocation: `${pathPrefix}/token/revocation`,
      token: `${pathPrefix}/token`,
      userinfo: `${pathPrefix}/me`,
      code_verification: `${pathPrefix}/device`
    }
  })

  await oidc.initialize({
    keystore: config.keystore,
    clients: [],
    adapter: RedisAdapter
  })
  oidc.proxy = true
  // TODO: re-enable this for cookie security
  // oidc.keys = process.env.SECURE_KEY.split(',')

  const router = new Router()

  const parse = bodyParser({})

  router.all(`${pathPrefix}/interaction/*`, views(path.join(__dirname, 'views'), { extension: 'ejs' }))

  const handlerMiddlewares = []
  handlers.forEach(handler => {
    const handlerRoute = handler(oidc, config)
    handlerMiddlewares.push(handlerRoute.routes())
    handlerMiddlewares.push(handlerRoute.allowedMethods())
  })

  router.use(`${pathPrefix}/interaction/:grant`,
      parse,
      async (ctx, next) => {
        ctx.state.details = {
          ...await oidc.interactionDetails(ctx.req),
          pathPrefix
        }
        await next()
      },
      ...handlerMiddlewares
    )

  router.all(`/.well-known/openid-configuration`, (ctx, next) => oidc.callback(ctx.req, ctx.res, ctx.next))
  router.all(`${pathPrefix}/*`, (ctx, next) => oidc.callback(ctx.req, ctx.res, ctx.next))

  return router
}

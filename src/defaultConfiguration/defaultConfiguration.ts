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
import resetPasswordHandler from './handlers/resetPassword.handler'

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
    adapter: RedisAdapter,
    findAccount: Account.findById,
    jwks: config.keystore,
    claims: {
      openid: ['sub'],
      email: ['email', 'email_verified']
    },
    interactions: {
      url: async (ctx) => {
        return `${pathPrefix}/interaction/${ctx.oidc.uuid}`
      },
    },
    formats: {
      AccessToken: 'jwt'
    },
    features: {
      devInteractions: { enabled: false }
    },
    routes: {
      authorization: `${pathPrefix}/auth`,
      jwks: `${pathPrefix}/certs`,
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

  oidc.proxy = true
  // TODO: re-enable this for cookie security
  // oidc.keys = process.env.SECURE_KEY.split(',')

  const router = new Router()

  const parse = bodyParser({})

  router.all(`${pathPrefix}/*`, views(path.join(__dirname, 'views'), { extension: 'ejs' }))

  router.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      return ctx.render('error', { message: err.message })
    }
  })

  const resetPasswordRouter = resetPasswordHandler(oidc, config)
  router.use(`${pathPrefix}/resetpassword`, parse, resetPasswordRouter.routes(), resetPasswordRouter.allowedMethods())

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

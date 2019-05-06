// Modified code from https://github.com/panva/node-oidc-provider-example/blob/43436a969a7bd589fea7e8ba83caa3fd4bc61854/03-oidc-views-accounts/index.js

import path from 'path'
import Router from 'koa-router'
import views from 'koa-views'
import bodyParser from 'koa-body'
import Provider from '../core/SolidIdp'
import RedisAdapter from './redisAdapter'
import Account from './account'
import { keystore } from './keystore'
import { tokenEndpointAuthMethod, grantType } from 'oidc-provider'

const DEFAULT_PATH_PREFIX = '/interaction/'

export interface DefaultConfigurationConfigs {
  issuer: string
  pathPrefix?: string
}

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
      devInteractions: false,
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
    keystore,
    clients: [],
    adapter: RedisAdapter
  })
  oidc.proxy = true
  // TODO: re-enable this for cookie security
  // oidc.keys = process.env.SECURE_KEY.split(',')

  const router = new Router()

  const parse = bodyParser({})

  router.all(`${pathPrefix}/interaction/*`, views(path.join(__dirname, 'views'), { extension: 'ejs' }))

  router.get(`${pathPrefix}/interaction/:grant`, async (ctx) => {
    const details = {
      ...await oidc.interactionDetails(ctx.req),
      pathPrefix
    }

    const view = (() => {
      switch (details.interaction.reason) {
        case 'consent_prompt':
        case 'client_not_authorized':
          return 'interaction'
        default:
          return 'login'
      }
    })()

    return ctx.render(view, { details })
  })

  router.post(`${pathPrefix}/interaction/:grant/confirm`, parse, (ctx, next) => {
    oidc.interactionFinished(ctx.req, ctx.res, {
      consent: {
        // TODO: add offline_access checkbox to confirm too
      }
    })
  })

  router.post(`${pathPrefix}/interaction/:grant/login`, parse, async (ctx, next) => {
    const account = await Account.authenticate(ctx.request.body.email, ctx.request.body.password)

    const result = {
      login: {
        account: account.accountId,
        remember: !!ctx.request.body.remember,
        ts: Math.floor(Date.now() / 1000)
      },
      consent: {
        rejectedScopes: ctx.request.body.remember ? [] : ['offline_access']
      }
    }

    return oidc.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false
    })
  })

  router.all(`/.well-known/*`, (ctx, next) => oidc.callback(ctx.req, ctx.res, ctx.next))
  router.all(`${pathPrefix}/*`, (ctx, next) => oidc.callback(ctx.req, ctx.res, ctx.next))

  return router
}

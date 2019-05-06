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
  pathPrefix: string
}

export default async function defaultConfiguration (config: DefaultConfigurationConfigs) {
  const pathPrefix = config.pathPrefix
  if (pathPrefix.substring(0, 1) !== '/') {
    throw new Error('config.pathPrefix should start with a slash, e.g. /interaction/')
  }
  if (pathPrefix.substr(-1) !== '/') {
    throw new Error('config.pathPrefix should end with a slash, e.g. /interaction/')
  }
  const oidc = new Provider(config.issuer, {
    findById: Account.findById,
    claims: {
      openid: ['sub'],
      email: ['email', 'email_verified']
    },
    interactionUrl (ctx) {
      return `${pathPrefix}${ctx.oidc.uuid}`
    },
    formats: {
      AccessToken: 'jwt'
    },
    features: {
      claimsParameter: true,
      discovery: true,
      encryption: true,
      introspection: true,
      registration: true,
      request: true,
      revocation: true,
      sessionManagement: true
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

  router.all(`${pathPrefix}*`, views(path.join(__dirname, 'views'), { extension: 'ejs' }))

  router.get(`${pathPrefix}:grant`, async (ctx) => {
    const details = await oidc.interactionDetails(ctx.req)

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

  router.post(`${pathPrefix}:grant/confirm`, parse, (ctx, next) => {
    oidc.interactionFinished(ctx.req, ctx.res, {
      consent: {
        // TODO: add offline_access checkbox to confirm too
      }
    })
  })

  router.post(`${pathPrefix}:grant/login`, parse, async (ctx, next) => {
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
  router.all(`${pathPrefix}*`, (ctx, next) => oidc.callback(ctx.req, ctx.res, ctx.next))

  return router
}

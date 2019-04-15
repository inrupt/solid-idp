// Modified code from https://github.com/panva/node-oidc-provider-example/blob/43436a969a7bd589fea7e8ba83caa3fd4bc61854/03-oidc-views-accounts/index.js

import path from 'path'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import Provider from '../src/core/SolidIdp'
import RedisAdapter from './redisAdapter'
import Account from './account'
import { tokenEndpointAuthMethod, grantType } from 'oidc-provider'

const ISSUER = process.env.ISSUER || 'https://api.swype.io'
const PORT = process.env.PORT || 3000

const oidc = new Provider(ISSUER, {

  // oidc-provider only looks up the accounts by their ID when it has to read the claims,
  // passing it our Account model method is sufficient, it should return a Promise that resolves
  // with an object with accountId property and a claims method.
  findById: Account.findById,

  // let's tell oidc-provider we also support the email scope, which will contain email and
  // email_verified claims
  claims: {
    // scope: [claims] format
    openid: ['sub'],
    email: ['email', 'email_verified']
  },

  // let's tell oidc-provider where our own interactions will be
  // setting a nested route is just good practice so that users
  // don't run into weird issues with multiple interactions open
  // at a time.
  interactionUrl (ctx) {
    return `/interaction/${ctx.oidc.uuid}`
  },
  formats: {
    AccessToken: 'jwt'
  },
  features: {
    // disable the packaged interactions
    devInteractions: false,

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

const keystore = require('./keystore.json')

oidc.initialize({
  keystore,
  clients: [
    // reconfigured the foo client for the purpose of showing the adapter working
    {
      client_id: 'foo',
      redirect_uris: ['https://example.com'],
      response_types: ['id_token token'],
      grant_types: ['implicit' as grantType],
      token_endpoint_auth_method: 'none' as tokenEndpointAuthMethod
    }
  ],
  // configure Provider to use the adapter
  adapter: RedisAdapter
}).then(() => {
  oidc.proxy = true
  // oidc.keys = process.env.SECURE_KEY.split(',')
}).then(() => {
  // let's work with express here, below is just the interaction definition
  const expressApp = express()
  expressApp.set('trust proxy', true)
  expressApp.set('view engine', 'ejs')
  expressApp.set('views', path.resolve(__dirname, 'views'))

  const parse = bodyParser.urlencoded({ extended: false })

  expressApp.get('/interaction/:grant', async (req, res) => {
    oidc.interactionDetails(req).then((details) => {
      console.log('see what else is available to you for interaction views', details)

      const view = (() => {
        switch (details.interaction.reason) {
          case 'consent_prompt':
          case 'client_not_authorized':
            return 'interaction'
          default:
            return 'login'
        }
      })()

      res.render(view, { details })
    })
  })

  expressApp.post('/interaction/:grant/confirm', parse, (req, res) => {
    oidc.interactionFinished(req, res, {
      consent: {
        // TODO: add offline_access checkbox to confirm too
      }
    })
  })

  expressApp.post('/interaction/:grant/login', parse, (req, res, next) => {
    Account.authenticate(req.body.email, req.body.password)
      .then(account => oidc.interactionFinished(req, res, {
        login: {
          account: account.accountId,
          remember: !!req.body.remember,
          ts: Math.floor(Date.now() / 1000)
        },
        consent: {
          rejectedScopes: req.body.remember ? [] : ['offline_access']
        }
      })).catch(next)
  })

  // leave the rest of the requests to be handled by oidc-provider, there's a catch all 404 there
  expressApp.use(oidc.callback)

  // express listen
  expressApp.listen(PORT)
})

// see previous example for the things that are not commented

// const Provider = require('oidc-provider')

// const oidc = new Provider(`https://api.swype.io`, {
//   // enable some of the feature, see the oidc-provider readme for more
//   formats: {
//     AccessToken: 'jwt'
//   },
//   features: {
//     claimsParameter: true,
//     discovery: true,
//     encryption: true,
//     introspection: true,
//     registration: true,
//     request: true,
//     revocation: true,
//     sessionManagement: true
//   }
// })

// oidc.initialize({
//   clients: [{ client_id: 'foo', client_secret: 'bar', redirect_uris: ['http://lvh.me/cb'] }]
// }).then(() => {
//   oidc.proxy = true
//   // oidc.keys = process.env.SECURE_KEY.split(',')
//   oidc.listen(3000)
// })

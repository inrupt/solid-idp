import Provider from '../../core/SolidIdp'
import Router from 'koa-router'
import Account from '../account'
import { Context } from 'koa';

export default function loginInteractionHandler(oidc: Provider): Router {
  const router = new Router()

  router.get(`/login`, async (ctx, next) => {
    return ctx.render('login', { errorMessage: '' })
  })

  router.post(`/login`, async (ctx, next) => {
    try {
      return await login(ctx.request.body.username, ctx.request.body.password, ctx, oidc)
    } catch (err) {
      return ctx.render('login', { errorMessage: err.message })
    }
  })

  return router
}

export async function login(username: string, password: string, ctx: Context, oidc: Provider) {
  const account = await Account.authenticate(username, password)

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
}
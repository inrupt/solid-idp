import Provider from '../../core/SolidIdp'
import Router from 'koa-router'
import Account from '../account'

export default function loginInteractionHandler(oidc: Provider): Router {
  const router = new Router()

  router.get(`/login`, async (ctx, next) => {
    return ctx.render('login', {})
  })

  router.post(`/login`, async (ctx, next) => {
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

  return router
}
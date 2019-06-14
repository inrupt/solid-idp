import Provider from '../../core/SolidIdp'
import Router from 'koa-router'

export default function confirmInteractionHandler(oidc: Provider): Router {
  const router = new Router()

  router.get(`/confirm`, async (ctx, next) => {
    return ctx.render('confirm', ctx.state.details)
  })

  router.post(`/confirm`, (ctx, next) => {
    oidc.interactionFinished(ctx.req, ctx.res, {
      consent: {
        // TODO: add offline_access checkbox to confirm too
      }
    })
  })

  return router
}
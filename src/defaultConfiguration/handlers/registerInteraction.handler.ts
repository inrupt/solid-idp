import Provider from '../../core/SolidIdp'
import Router from 'koa-router'

export default function registerInteractionHandler(oidc: Provider): Router {
  const router = new Router()

  router.get(`/register`, async (ctx, next) => {
    return ctx.render('register', ctx.state.details)
  })

  router.post(`/register`, async (ctx, next) => {

  })

  return router
}
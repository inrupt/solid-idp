import Provider from '../../core/SolidIdp'
import Router from 'koa-router'
import { getTokenAndLogin } from './loginInteraction.handler';

export default function confirmInteractionHandler(oidc: Provider): Router {
  const router = new Router()

  router.get(`/confirm`, async (ctx, next) => {
    return ctx.render('confirm', ctx.state.details)
  })

  router.post(`/confirm`, async (ctx, next) => {
    return await getTokenAndLogin(ctx.state.details.accountId, ctx, oidc)
  })

  return router
}
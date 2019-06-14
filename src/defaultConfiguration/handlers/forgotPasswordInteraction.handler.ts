import Provider from '../../core/SolidIdp'
import Router from 'koa-router'

export default function forgotPasswordInteractionHandler(oidc: Provider): Router {
  const router = new Router()

  router.get(`/forgotpassword`, async (ctx, next) => {
    return ctx.render('forgotPassword', ctx.state.details)
  })

  router.post(`/forgotpassword`, async (ctx, next) => {

  })

  router.get(`/resetpassword`, async (ctx, next) => {
    return ctx.render('resetPassword', ctx.state.details)
  })

  router.post('/resetPassword', async (ctx, next) => {
    
  })

  return router
}
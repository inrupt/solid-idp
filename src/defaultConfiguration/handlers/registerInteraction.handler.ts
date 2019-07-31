import Provider from '../../core/SolidIdp'
import Router from 'koa-router'
import assert from 'assert'
import Account from '../account';
import { login } from './loginInteraction.handler';
import { DefaultConfigurationConfigs } from '../defaultConfiguration';

export default function registerInteractionHandler(oidc: Provider, config: DefaultConfigurationConfigs): Router {
  const router = new Router()

  router.get(`/register`, async (ctx, next) => {
    return ctx.render('register', ctx.state.details)
  })

  router.post(`/register`, async (ctx, next) => {
    const email = String(ctx.request.body.email).toLowerCase()
    const username = String(ctx.request.body.webId).toLowerCase()
    const webId = await config.webIdFromUsername(username)
    const password = String(ctx.request.body.password)
    assert(email, "Email required")
    assert(password, "Password required")
    assert(username, 'Username required')
    await Account.create(email, password, username, webId)
    return login(username, password, ctx, oidc)
  })

  return router
}
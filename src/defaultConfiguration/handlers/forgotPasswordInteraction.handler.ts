import Provider from '../../core/SolidIdp'
import Router from 'koa-router'
import nodemailer from 'nodemailer'
import Account from '../account';
import assert from 'assert'
import { DefaultConfigurationConfigs } from '../defaultConfiguration';

export default function forgotPasswordInteractionHandler(oidc: Provider, config: DefaultConfigurationConfigs): Router {
  const mailTransporter = nodemailer.createTransport(config.mailConfiguration)


  const router = new Router()

  router.get(`/forgotpassword`, async (ctx, next) => {
    return ctx.render('forgotPassword', { errorMessage: '' })
  })

  router.post(`/forgotpassword`, async (ctx, next) => {
    try {
      const username = ctx.request.body.username
      assert(username, 'Username required')
      const { email, uuid } = await Account.generateForgotPassword(ctx.request.body.username)
      const passwordResetLink = `${config.issuer}/${config.pathPrefix ? `${config.pathPrefix}/` : ''}resetpassword/${uuid}`
      const mailInfo = await mailTransporter.sendMail({
        from: `"Solid" <${config.mailConfiguration.auth.user}>`,
        to: email,
        subject: 'Reset your password',
        text: `Reset your password at ${passwordResetLink}`,
        html: `
          <h1>Reset your password</h1>
          <p>Click <a href="${passwordResetLink}">here</a> to reset your password.</p>
        `
      })
      return ctx.render('emailSent', {
        username
      })
    } catch(err) {
      return ctx.render('forgotPassword', {
        errorMessage: err.message
      })
    }
  })

  return router
}
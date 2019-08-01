import Provider from '../../core/SolidIdp'
import Router from 'koa-router'
import nodemailer from 'nodemailer'
import Account from '../account';
import { DefaultConfigurationConfigs } from '../defaultConfiguration';

export default function forgotPasswordInteractionHandler(oidc: Provider, config: DefaultConfigurationConfigs): Router {
  const mailTransporter = nodemailer.createTransport(config.mailConfiguration)


  const router = new Router()

  router.get(`/forgotpassword`, async (ctx, next) => {
    return ctx.render('forgotPassword', ctx.state.details)
  })

  router.post(`/forgotpassword`, async (ctx, next) => {
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
    return ctx.render('message', {
      message: `An email has been sent with a password reset link.`
    })
  })

  return router
}
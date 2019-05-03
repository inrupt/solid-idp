import Provider, { InitializationConfiguration, ProviderConfiguration } from 'oidc-provider'
import cors from '@koa/cors'
import * as url from 'url'

export default class SolidIdp extends Provider {

  constructor (issuer: string, config: ProviderConfiguration) {
    super(issuer, {
      ...config,
      features: {
        ...config.features,

        registration: {
          enabled: true,
          idFactory: (ctx) => {
            const parsedOrigin = url.parse(ctx.headers.origin)
            ctx.oidc.body && Array.isArray(ctx.oidc.body.redirect_uris) && ctx.oidc.body.redirect_uris.map(uri => {
              const parsedUri = url.parse(uri)
              if (parsedUri.host !== parsedOrigin.host) {
                throw new Provider.errors.InvalidClientMetadata(`${uri} is an invalid redirect Uri. Redirect uris must be on the same origin.`)
              }
            })
            return ctx.headers.origin
          }
        }

      },
      whitelistedJWA: {
        requestObjectSigningAlgValues: ['none', 'HS256', 'RS256', 'PS256', 'ES256']
      },
      extraParams: ['key']
    })
  }

  async initialize (config: InitializationConfiguration): Promise<void> {
    await super.initialize(config)
    this.app.use(cors())
  }
}

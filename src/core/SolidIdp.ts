import Provider, { InitializationConfiguration, ProviderConfiguration } from 'oidc-provider'
import cors from '@koa/cors'

export default class SolidIdp extends Provider {

  constructor (issuer: string, config: ProviderConfiguration) {
    super(issuer, {
      ...config,
      features: {
        ...config.features,
        registration: {
          enabled: true,
          idFactory: (ctx) => {
            return ctx.headers.origin
          }
        }
      },
      whitelistedJWA: {
        requestObjectSigningAlgValues: ['none', 'HS256', 'RS256', 'PS256', 'ES256']
      }
    })
  }

  async initialize (config: InitializationConfiguration): Promise<void> {
    await super.initialize(config)
    this.app.use(cors())
  }
}

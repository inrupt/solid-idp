import Provider, { ProviderConfiguration } from 'oidc-provider'
import cors from '@koa/cors'
import * as url from 'url'

export default class SolidIdp extends Provider {

  constructor (issuer: string, config: ProviderConfiguration) {
    super(issuer, {
      ...config,
      features: {
        ...config.features,

        registration: {
          enabled: true
        }
      },
      whitelistedJWA: {
        requestObjectSigningAlgValues: ['none', 'HS256', 'RS256', 'PS256', 'ES256']
      },
      extraParams: ['key'],
      clientBasedCORS: async () => true
    })
    this.use(cors())
  }

  // TODO Bring back CORS
  // TODO PoP Token
}

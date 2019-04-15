import Provider, { InitializationConfiguration } from 'oidc-provider'
import cors from '@koa/cors'

export default class SolidIdp extends Provider {

  async initialize (config: InitializationConfiguration): Promise<void> {
    await super.initialize(config)
    this.app.use(cors())
  }
}

import Provider, { ProviderConfiguration } from 'oidc-provider';
export default class SolidIdp extends Provider {
    constructor(issuer: string, config: ProviderConfiguration);
}

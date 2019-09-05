import Provider from '../../core/SolidIdp';
import Router from 'koa-router';
import { DefaultConfigurationConfigs } from '../defaultConfiguration';
export default function resetPasswordHandler(oidc: Provider, config: DefaultConfigurationConfigs): Router;

import Provider from '../../core/SolidIdp';
import Router from 'koa-router';
import { DefaultConfigurationConfigs } from '../defaultConfiguration';
export default function forgotPasswordInteractionHandler(oidc: Provider, config: DefaultConfigurationConfigs): Router;

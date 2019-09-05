import Provider from '../../core/SolidIdp';
import Router from 'koa-router';
import { DefaultConfigurationConfigs } from '../defaultConfiguration';
export default function registerInteractionHandler(oidc: Provider, config: DefaultConfigurationConfigs): Router;

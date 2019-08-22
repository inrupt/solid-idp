import Provider from '../../core/SolidIdp';
import Router from 'koa-router';
import { Context } from 'koa';
import { DefaultConfigurationConfigs, DefaultAccountAdapter } from '../defaultConfiguration';
export default function loginInteractionHandler(oidc: Provider, config: DefaultConfigurationConfigs): Router;
export declare function login(username: string, password: string, ctx: Context, oidc: Provider, accountAdapter: DefaultAccountAdapter): Promise<void>;
export declare function getTokenAndLogin(accountId: string, ctx: Context, oidc: Provider): Promise<void>;

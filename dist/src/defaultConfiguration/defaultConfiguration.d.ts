import Router from 'koa-router';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Adapter, Account } from 'oidc-provider';
export interface DefaultAccountAdapter {
    authenticate(username: string, password: string): Promise<Account>;
    create(email: string, password: string, username: string, webID: string): Promise<void>;
    changePassword(username: string, password: string): Promise<void>;
    generateForgotPassword(username: string): Promise<{
        email: string;
        uuid: string;
    }>;
    getForgotPassword(uuid: string): Promise<string>;
    deleteForgotPassword(uuid: string): Promise<void>;
}
export interface SolidIDPStorage {
    sessionAdapter: new (name: string, config?: DefaultConfigurationConfigs) => Adapter;
    accountAdapter: new (config?: DefaultConfigurationConfigs) => DefaultAccountAdapter;
}
export interface SolidIDPStorage {
}
export interface DefaultConfigurationConfigs {
    keystore: any;
    issuer: string;
    pathPrefix?: string;
    mailConfiguration?: SMTPTransport.Options;
    webIdFromUsername: (username: string) => Promise<string>;
    onNewUser: (username: string) => Promise<string>;
    storagePreset?: 'redis' | 'filesystem';
    storage?: SolidIDPStorage;
    storageData?: any;
}
export default function defaultConfiguration(config: DefaultConfigurationConfigs): Promise<Router<any, {}>>;

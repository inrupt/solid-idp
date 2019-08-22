import { Context } from 'koa';
import { Account } from 'oidc-provider';
export default class DefaultConfigAccount implements Account {
    accountId: string;
    constructor(id: string);
    claims(): Promise<{
        sub: string;
    }>;
    static findById(ctx: Context, sub: string): Promise<DefaultConfigAccount>;
}

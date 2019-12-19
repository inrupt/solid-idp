"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_views_1 = __importDefault(require("koa-views"));
const koa_body_1 = __importDefault(require("koa-body"));
const SolidIdp_1 = __importDefault(require("../core/SolidIdp"));
const confirmInteraction_handler_1 = __importDefault(require("./handlers/confirmInteraction.handler"));
const initialInteraction_handler_1 = __importDefault(require("./handlers/initialInteraction.handler"));
const loginInteraction_handler_1 = __importDefault(require("./handlers/loginInteraction.handler"));
const forgotPasswordInteraction_handler_1 = __importDefault(require("./handlers/forgotPasswordInteraction.handler"));
const registerInteraction_handler_1 = __importDefault(require("./handlers/registerInteraction.handler"));
const resetPassword_handler_1 = __importDefault(require("./handlers/resetPassword.handler"));
const account_1 = __importDefault(require("./account"));
const filesystemAdapter_1 = __importDefault(require("./storage/filesystem/filesystemAdapter"));
const redisAdapter_1 = __importDefault(require("./storage/redis/redisAdapter"));
const redisAccount_1 = __importDefault(require("./storage/redis/redisAccount"));
const filesystemAccount_1 = __importDefault(require("./storage/filesystem/filesystemAccount"));
const debug = debug_1.default('defaultConfiguration');
const handlers = [
    initialInteraction_handler_1.default,
    confirmInteraction_handler_1.default,
    loginInteraction_handler_1.default,
    forgotPasswordInteraction_handler_1.default,
    registerInteraction_handler_1.default
];
function defaultConfiguration(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const pathPrefix = config.pathPrefix || '';
        if (config.storagePreset) {
            switch (config.storagePreset) {
                case 'redis':
                    config.storage = {
                        sessionAdapter: redisAdapter_1.default(config),
                        accountAdapter: redisAccount_1.default(config)
                    };
                    break;
                case 'filesystem':
                    config.storage = {
                        sessionAdapter: yield filesystemAdapter_1.default(config),
                        accountAdapter: yield filesystemAccount_1.default(config)
                    };
            }
        }
        const oidc = new SolidIdp_1.default(config.issuer, {
            adapter: config.storage.sessionAdapter,
            findAccount: account_1.default.findById,
            jwks: config.keystore,
            claims: {
                openid: ['sub'],
                email: ['email', 'email_verified']
            },
            interactions: {
                url: (ctx) => __awaiter(this, void 0, void 0, function* () {
                    return `${pathPrefix}/interaction/${ctx.oidc.uid}`;
                })
            },
            formats: {
                AccessToken: 'jwt',
                default: 'opaque'
            },
            features: {
                devInteractions: { enabled: false },
                dangerouslyEnableLocalhost: new URL(config.issuer).protocol !== 'https:',
                dangerouslyAllowLocalhostRedirectOnImplicitFlow: config.dangerouslyAllowLocalhostRedirectOnImplicitFlow
            },
            routes: {
                authorization: `${pathPrefix}/auth`,
                jwks: `${pathPrefix}/certs`,
                check_session: `${pathPrefix}/session/check`,
                device_authorization: `${pathPrefix}/device/auth`,
                end_session: `${pathPrefix}/session/end`,
                introspection: `${pathPrefix}/token/introspection`,
                registration: `${pathPrefix}/reg`,
                revocation: `${pathPrefix}/token/revocation`,
                token: `${pathPrefix}/token`,
                userinfo: `${pathPrefix}/me`,
                code_verification: `${pathPrefix}/device`
            }
        });
        oidc.proxy = true;
        const router = new koa_router_1.default();
        const parse = koa_body_1.default({});
        router.all(`${pathPrefix}/*`, koa_views_1.default(path_1.default.join(__dirname, 'views'), { extension: 'ejs' }));
        router.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield next();
            }
            catch (err) {
                debug(err);
                return ctx.render('error', { message: err.message });
            }
        }));
        const resetPasswordRouter = resetPassword_handler_1.default(oidc, config);
        router.use(`${pathPrefix}/resetpassword`, parse, resetPasswordRouter.routes(), resetPasswordRouter.allowedMethods());
        const handlerMiddlewares = [];
        handlers.forEach(handler => {
            const handlerRoute = handler(oidc, config);
            handlerMiddlewares.push(handlerRoute.routes());
            handlerMiddlewares.push(handlerRoute.allowedMethods());
        });
        router.use(`${pathPrefix}/interaction/:grant`, parse, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.state.details = Object.assign({}, yield oidc.interactionDetails(ctx.req), { pathPrefix });
            yield next();
        }), ...handlerMiddlewares);
        router.all(`/.well-known/openid-configuration`, (ctx, next) => oidc.callback(ctx.req, ctx.res, ctx.next));
        router.all(`${pathPrefix}/*`, (ctx, next) => oidc.callback(ctx.req, ctx.res, ctx.next));
        return router;
    });
}
exports.default = defaultConfiguration;
//# sourceMappingURL=defaultConfiguration.js.map
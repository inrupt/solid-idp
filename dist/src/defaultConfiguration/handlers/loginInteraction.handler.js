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
const assert_1 = __importDefault(require("assert"));
const koa_router_1 = __importDefault(require("koa-router"));
function loginInteractionHandler(oidc, config) {
    const router = new koa_router_1.default();
    const accountAdapter = new config.storage.accountAdapter();
    router.get(`/login`, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        return ctx.render('login', {
            errorMessage: '',
            prefilled: {}
        });
    }));
    router.post(`/login`, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            assert_1.default(ctx.request.body.username, 'Username is required');
            assert_1.default(ctx.request.body.password, 'Password is required');
            return yield login(ctx.request.body.username, ctx.request.body.password, ctx, oidc, accountAdapter);
        }
        catch (err) {
            return ctx.render('login', {
                errorMessage: err.message,
                prefilled: {
                    username: ctx.request.body.username
                }
            });
        }
    }));
    return router;
}
exports.default = loginInteractionHandler;
function login(username, password, ctx, oidc, accountAdapter) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield accountAdapter.authenticate(username, password);
        return getTokenAndLogin(account.accountId, ctx, oidc);
    });
}
exports.login = login;
function getTokenAndLogin(accountId, ctx, oidc) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {
            login: {
                account: accountId,
                remember: !!ctx.request.body.remember,
                ts: Math.floor(Date.now() / 1000)
            },
            consent: {
                rejectedScopes: ctx.request.body.remember ? [] : ['offline_access']
            }
        };
        return oidc.interactionFinished(ctx.req, ctx.res, result);
    });
}
exports.getTokenAndLogin = getTokenAndLogin;
//# sourceMappingURL=loginInteraction.handler.js.map
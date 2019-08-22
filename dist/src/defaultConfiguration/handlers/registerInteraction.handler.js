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
const koa_router_1 = __importDefault(require("koa-router"));
const assert_1 = __importDefault(require("assert"));
const loginInteraction_handler_1 = require("./loginInteraction.handler");
function registerInteractionHandler(oidc, config) {
    const router = new koa_router_1.default();
    const accountAdapter = new config.storage.accountAdapter();
    router.get(`/register`, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        return ctx.render('register', {
            errorMessage: '',
            prefilled: {}
        });
    }));
    router.post(`/register`, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        let email;
        let username;
        let password;
        let confirmPassword;
        try {
            email = String(ctx.request.body.email).toLowerCase();
            username = String(ctx.request.body.webId).toLowerCase();
            const webId = yield config.webIdFromUsername(username);
            password = String(ctx.request.body.password);
            confirmPassword = String(ctx.request.body.confirmPassword);
            assert_1.default(password, 'Password required');
            assert_1.default(confirmPassword, 'Password confirmation required');
            assert_1.default(username, 'Username required');
            assert_1.default(/^[a-zA-Z0-9_-]*$/.test(username), `Usernames must only have letters, numbers, "_" or "-"`);
            assert_1.default(password === confirmPassword, 'Passwords do not match');
            assert_1.default(email, 'Email required');
            assert_1.default(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email), 'Invalid email');
            yield accountAdapter.create(email, password, username, webId);
            return yield loginInteraction_handler_1.login(username, password, ctx, oidc, accountAdapter);
        }
        catch (err) {
            return ctx.render('register', {
                errorMessage: err.message,
                prefilled: {
                    email,
                    username
                }
            });
        }
    }));
    return router;
}
exports.default = registerInteractionHandler;
//# sourceMappingURL=registerInteraction.handler.js.map
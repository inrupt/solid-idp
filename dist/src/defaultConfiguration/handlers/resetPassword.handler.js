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
function resetPasswordHandler(oidc, config) {
    const router = new koa_router_1.default();
    const accountAdapter = new config.storage.accountAdapter();
    router.get(`/:uuid`, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        assert_1.default(ctx.params && ctx.params.uuid, 'A forgot password uuid must be provided. Use the link from your email.');
        assert_1.default(yield accountAdapter.getForgotPassword(ctx.params.uuid), 'This reset password link is no longer valid.');
        return ctx.render('resetPassword', {
            pathPrefix: config.pathPrefix || '',
            forgotPasswordUUID: ctx.params.uuid,
            errorMessage: ''
        });
    }));
    router.post('/:uuid', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            assert_1.default(ctx.params && ctx.params.uuid, 'A forgot password uuid must be provided. Use the link from your email.');
            assert_1.default(ctx.request.body && ctx.request.body.password, 'Password must be provided.');
            const forgotPasswordUUID = ctx.params.uuid;
            const password = ctx.request.body.password;
            const confirmPassword = ctx.request.body.confirmPassword;
            assert_1.default(password, 'Password is required');
            assert_1.default(confirmPassword, 'Password confirmation is required');
            assert_1.default(password === confirmPassword, 'Passwords do not match');
            const username = yield accountAdapter.getForgotPassword(forgotPasswordUUID);
            assert_1.default(username, 'This reset password link is no longer valid.');
            yield accountAdapter.changePassword(username, password);
            yield accountAdapter.deleteForgotPassword(forgotPasswordUUID);
            return ctx.render('message', {
                message: 'Password was successfully reset'
            });
        }
        catch (err) {
            return ctx.render('resetPassword', {
                pathPrefix: config.pathPrefix || '',
                forgotPasswordUUID: ctx.params.uuid,
                errorMessage: err.message
            });
        }
    }));
    return router;
}
exports.default = resetPasswordHandler;
//# sourceMappingURL=resetPassword.handler.js.map
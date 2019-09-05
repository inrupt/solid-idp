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
const nodemailer_1 = __importDefault(require("nodemailer"));
const assert_1 = __importDefault(require("assert"));
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('forgotPassword');
const dummyMailer = {
    sendMail(config) {
        debug(`Sending Mail:\nTo: ${config.to}\nFrom: ${config.from}\nSubject: ${config.subject}\n${config.html}`);
    }
};
function forgotPasswordInteractionHandler(oidc, config) {
    const accountAdapter = new config.storage.accountAdapter();
    const mailFrom = config.mailConfiguration ? config.mailConfiguration.auth.user : 'Solid';
    const mailTransporter = (config.mailConfiguration) ? nodemailer_1.default.createTransport(config.mailConfiguration) : dummyMailer;
    const router = new koa_router_1.default();
    router.get(`/forgotpassword`, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        return ctx.render('forgotPassword', { errorMessage: '' });
    }));
    router.post(`/forgotpassword`, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const username = ctx.request.body.username;
            assert_1.default(username, 'Username required');
            const { email, uuid } = yield accountAdapter.generateForgotPassword(ctx.request.body.username);
            const passwordResetLink = `${config.issuer}/${config.pathPrefix ? `${config.pathPrefix}/` : ''}resetpassword/${uuid}`;
            const mailInfo = mailTransporter.sendMail({
                from: `"Solid" <${mailFrom}>`,
                to: email,
                subject: 'Reset your password',
                text: `Reset your password at ${passwordResetLink}`,
                html: `
          <h1>Reset your password</h1>
          <p>Click <a href="${passwordResetLink}">here</a> to reset your password.</p>
        `
            });
            return ctx.render('emailSent', {
                username
            });
        }
        catch (err) {
            return ctx.render('forgotPassword', {
                errorMessage: err.message
            });
        }
    }));
    return router;
}
exports.default = forgotPasswordInteractionHandler;
//# sourceMappingURL=forgotPasswordInteraction.handler.js.map
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
const loginInteraction_handler_1 = require("./loginInteraction.handler");
function confirmInteractionHandler(oidc) {
    const router = new koa_router_1.default();
    router.get(`/confirm`, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        return ctx.render('confirm', ctx.state.details);
    }));
    router.post(`/confirm`, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        return loginInteraction_handler_1.getTokenAndLogin(ctx.state.details.session.accountId, ctx, oidc);
    }));
    return router;
}
exports.default = confirmInteractionHandler;
//# sourceMappingURL=confirmInteraction.handler.js.map
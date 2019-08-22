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
const oidc_provider_1 = __importDefault(require("oidc-provider"));
const koa_cors_1 = __importDefault(require("koa-cors"));
class SolidIdp extends oidc_provider_1.default {
    constructor(issuer, config) {
        super(issuer, Object.assign({}, config, { features: Object.assign({}, config.features, { registration: {
                    enabled: true
                }, request: {
                    enabled: true
                }, dPoP: {
                    enabled: true
                } }), whitelistedJWA: {
                requestObjectSigningAlgValues: ['none', 'HS256', 'RS256', 'PS256', 'ES256']
            }, extraParams: ['key'], clientBasedCORS: () => __awaiter(this, void 0, void 0, function* () { return true; }), responseTypes: [
                'id_token token'
            ], scopes: [
                'openid',
                'offline_access',
                'profile'
            ] }));
        this.use(koa_cors_1.default());
    }
}
exports.default = SolidIdp;
//# sourceMappingURL=SolidIdp.js.map
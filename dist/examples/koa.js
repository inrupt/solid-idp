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
const koa_1 = __importDefault(require("koa"));
const src_1 = require("../src");
const keystore_1 = require("./keystore");
const path_1 = __importDefault(require("path"));
const PORT = 3000;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const idpRouter = yield src_1.defaultConfiguration({
            issuer: 'https://api.swype.io',
            pathPrefix: '',
            keystore: keystore_1.keystore,
            mailConfiguration: (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? {
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            } : undefined,
            webIdFromUsername: (username) => __awaiter(this, void 0, void 0, function* () {
                return `https://${username}.api.swype.io/profile/card#me`;
            }),
            storagePreset: 'filesystem',
            storageData: {
                redisUrl: process.env.REDIS_URL || '',
                folder: path_1.default.join(__dirname, './.db')
            }
        });
        const app = new koa_1.default();
        app.use(idpRouter.routes());
        app.use(idpRouter.allowedMethods());
        app.listen(PORT);
        console.log(`Listening on port ${PORT}`);
    });
}
void init();
//# sourceMappingURL=koa.js.map
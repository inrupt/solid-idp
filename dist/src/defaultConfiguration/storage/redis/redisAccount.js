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
const ioredis_1 = __importDefault(require("ioredis"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = __importDefault(require("uuid"));
const account_1 = __importDefault(require("../../account"));
const REDIS_URL = process.env.REDIS_URL || '';
const SALT_ROUNDS = 10;
function getRedisAccount(config) {
    const client = new ioredis_1.default(config.storageData.redisUrl, { keyPrefix: 'user' });
    return class RedisAccount {
        authenticate(username, password) {
            return __awaiter(this, void 0, void 0, function* () {
                assert_1.default(password, 'Password must be provided');
                assert_1.default(username, 'Username must be provided');
                const lowercased = String(username).toLowerCase();
                const user = JSON.parse(yield client.get(this.key(username)));
                assert_1.default(user, 'User does not exist');
                assert_1.default(yield bcryptjs_1.default.compare(password, user.password), 'Incorrect Password');
                return new account_1.default(user.webID);
            });
        }
        create(email, password, username, webID) {
            return __awaiter(this, void 0, void 0, function* () {
                const curUser = yield client.get(this.key(username));
                assert_1.default(!curUser, 'User already exists.');
                const hashedPassword = yield bcryptjs_1.default.hash(password, SALT_ROUNDS);
                yield client.set(this.key(username), JSON.stringify({
                    username,
                    webID,
                    email,
                    password: hashedPassword
                }));
            });
        }
        changePassword(username, password) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = JSON.parse(yield client.get(this.key(username)));
                user.password = yield bcryptjs_1.default.hash(password, SALT_ROUNDS);
                yield client.set(this.key(username), JSON.stringify(user));
            });
        }
        key(name) {
            return `user:${name}`;
        }
        generateForgotPassword(username) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = JSON.parse(yield client.get(this.key(username)));
                assert_1.default(user, 'The username does not exist.');
                const forgotPasswordUUID = uuid_1.default.v4();
                yield client.set(this.forgotPasswordKey(forgotPasswordUUID), username, 'EX', 60 * 60 * 24);
                return {
                    email: user.email,
                    uuid: forgotPasswordUUID
                };
            });
        }
        getForgotPassword(uuid) {
            return __awaiter(this, void 0, void 0, function* () {
                return client.get(this.forgotPasswordKey(uuid));
            });
        }
        deleteForgotPassword(uuid) {
            return __awaiter(this, void 0, void 0, function* () {
                yield client.del(this.forgotPasswordKey(uuid));
            });
        }
        forgotPasswordKey(name) {
            return `forgotPassword:${name}`;
        }
    };
}
exports.default = getRedisAccount;
//# sourceMappingURL=redisAccount.js.map
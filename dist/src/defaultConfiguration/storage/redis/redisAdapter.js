"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const lodash_1 = require("lodash");
const REDIS_URL = process.env.REDIS_URL || '';
const consumable = new Set([
    'AuthorizationCode',
    'RefreshToken',
    'DeviceCode'
]);
function grantKeyFor(id) {
    return `grant:${id}`;
}
function userCodeKeyFor(userCode) {
    return `userCode:${userCode}`;
}
function uidKeyFor(uid) {
    return `uid:${uid}`;
}
function getRedisAdapter(config) {
    return class RedisAdapter {
        constructor(name) {
            this.name = name;
            this.client = new ioredis_1.default(REDIS_URL, { keyPrefix: 'oidc:' });
        }
        upsert(id, payload, expiresIn) {
            return __awaiter(this, void 0, void 0, function* () {
                const key = this.key(id);
                const store = consumable.has(this.name)
                    ? { payload: JSON.stringify(payload) } : JSON.stringify(payload);
                const multi = this.client.multi();
                multi[consumable.has(this.name) ? 'hmset' : 'set'](key, store);
                if (expiresIn) {
                    multi.expire(key, expiresIn);
                }
                if (payload.grantId) {
                    const grantKey = grantKeyFor(payload.grantId);
                    multi.rpush(grantKey, key);
                    const ttl = yield this.client.ttl(grantKey);
                    if (expiresIn > ttl) {
                        multi.expire(grantKey, expiresIn);
                    }
                }
                if (payload.userCode) {
                    const userCodeKey = userCodeKeyFor(payload.userCode);
                    multi.set(userCodeKey, id);
                    multi.expire(userCodeKey, expiresIn);
                }
                if (payload.uid) {
                    const uidKey = uidKeyFor(payload.uid);
                    multi.set(uidKey, id);
                    multi.expire(uidKey, expiresIn);
                }
                yield multi.exec();
            });
        }
        find(id) {
            return __awaiter(this, void 0, void 0, function* () {
                const data = consumable.has(this.name)
                    ? yield this.client.hgetall(this.key(id))
                    : yield this.client.get(this.key(id));
                if (lodash_1.isEmpty(data)) {
                    return undefined;
                }
                if (typeof data === 'string') {
                    return JSON.parse(data);
                }
                const { payload } = data, rest = __rest(data, ["payload"]);
                return Object.assign({}, rest, JSON.parse(payload));
            });
        }
        findByUid(uid) {
            return __awaiter(this, void 0, void 0, function* () {
                const id = yield this.client.get(uidKeyFor(uid));
                return this.find(id);
            });
        }
        findByUserCode(userCode) {
            return __awaiter(this, void 0, void 0, function* () {
                const id = yield this.client.get(userCodeKeyFor(userCode));
                return this.find(id);
            });
        }
        destroy(id) {
            return __awaiter(this, void 0, void 0, function* () {
                const key = this.key(id);
                yield this.client.del(key);
            });
        }
        revokeByGrantId(grantId) {
            return __awaiter(this, void 0, void 0, function* () {
                const multi = this.client.multi();
                const tokens = yield this.client.lrange(grantKeyFor(grantId), 0, -1);
                tokens.forEach((token) => multi.del(token));
                multi.del(grantKeyFor(grantId));
                yield multi.exec();
            });
        }
        consume(id) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.client.hset(this.key(id), 'consumed', Math.floor(Date.now() / 1000));
            });
        }
        key(id) {
            return `${this.name}:${id}`;
        }
    };
}
exports.default = getRedisAdapter;
//# sourceMappingURL=redisAdapter.js.map
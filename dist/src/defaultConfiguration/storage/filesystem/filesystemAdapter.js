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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("mz/fs"));
const consumable = new Set([
    'AuthorizationCode',
    'RefreshToken',
    'DeviceCode'
]);
function grantKeyFor(id) {
    return `grant:${id}`;
}
function sessionUidKeyFor(id) {
    return `sessionUid:${id}`;
}
function userCodeKeyFor(userCode) {
    return `userCode:${userCode}`;
}
function getFilesystemAdapater(config) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            fs_1.default.mkdir(path_1.default.join(config.storageData.folder, './openid'), { recursive: true })
        ]);
        return class FilesystemAdapter {
            constructor(name) {
                this.name = name;
            }
            filename(id) {
                return path_1.default.join(config.storageData.folder, './openid', `./_key_${encodeURIComponent(id)}.json`);
            }
            set(id, payload, expiresIn) {
                return __awaiter(this, void 0, void 0, function* () {
                    const data = {
                        payload
                    };
                    if (expiresIn) {
                        data._ex = new Date().getTime() + expiresIn * 1000;
                    }
                    yield fs_1.default.writeFile(this.filename(id), JSON.stringify(data));
                });
            }
            get(id) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const data = JSON.parse((yield fs_1.default.readFile(this.filename(id))).toString());
                        if (data._ex && data._ex < new Date().getTime()) {
                            yield this.delete(id);
                            return undefined;
                        }
                        return data.payload;
                    }
                    catch (err) {
                        return undefined;
                    }
                });
            }
            delete(id) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield fs_1.default.unlink(this.filename(id));
                });
            }
            key(id) {
                return `${this.name}:${id}`;
            }
            destroy(id) {
                return __awaiter(this, void 0, void 0, function* () {
                    const key = this.key(id);
                    yield this.delete(key);
                });
            }
            consume(id) {
                return __awaiter(this, void 0, void 0, function* () {
                    const item = (yield this.get(this.key(id)));
                    item.consumed = new Date().getTime();
                    yield this.set(this.key(id), item);
                });
            }
            find(id) {
                return __awaiter(this, void 0, void 0, function* () {
                    return this.get(this.key(id));
                });
            }
            findByUid(uid) {
                return __awaiter(this, void 0, void 0, function* () {
                    const id = yield this.get(sessionUidKeyFor(uid));
                    return this.find(id);
                });
            }
            findByUserCode(userCode) {
                return __awaiter(this, void 0, void 0, function* () {
                    const id = yield this.get(userCodeKeyFor(userCode));
                    return this.find(id);
                });
            }
            upsert(id, payload, expiresIn) {
                return __awaiter(this, void 0, void 0, function* () {
                    const key = this.key(id);
                    if (this.name === 'Session') {
                        yield this.set(sessionUidKeyFor(payload.uid), id, expiresIn);
                    }
                    const { grantId, userCode } = payload;
                    if (grantId) {
                        const grantKey = grantKeyFor(grantId);
                        const grant = yield this.get(grantKey);
                        if (!grant) {
                            yield this.set(grantKey, [key]);
                        }
                        else {
                            yield this.set(grantKey, [...grant, key]);
                        }
                    }
                    if (userCode) {
                        yield this.set(userCodeKeyFor(userCode), id, expiresIn);
                    }
                    yield this.set(key, payload, expiresIn);
                });
            }
            revokeByGrantId(grantId) {
                return __awaiter(this, void 0, void 0, function* () {
                    const grantKey = grantKeyFor(grantId);
                    const grant = (yield this.get(grantKey));
                    if (grant) {
                        grant.forEach((token) => __awaiter(this, void 0, void 0, function* () { return this.delete(token); }));
                        yield this.delete(grantKey);
                    }
                });
            }
        };
    });
}
exports.default = getFilesystemAdapater;
//# sourceMappingURL=filesystemAdapter.js.map
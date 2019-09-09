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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = __importDefault(require("uuid"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("mz/fs"));
const account_1 = __importDefault(require("../../account"));
const SALT_ROUNDS = 10;
function getFilesystemAccount(config) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            fs_1.default.mkdir(path_1.default.join(config.storageData.folder, './oidc/users/users'), { recursive: true }),
            fs_1.default.mkdir(path_1.default.join(config.storageData.folder, './oidc/users/users-by-email'), { recursive: true }),
            fs_1.default.mkdir(path_1.default.join(config.storageData.folder, './oidc/users/forgot-password'), { recursive: true })
        ]);
        return class FilesystemAccount {
            authenticate(username, password) {
                return __awaiter(this, void 0, void 0, function* () {
                    assert_1.default(password, 'Password must be provided');
                    assert_1.default(username, 'Username must be provided');
                    const user = yield this.getUser(username);
                    assert_1.default(user, 'User does not exist');
                    assert_1.default(yield bcryptjs_1.default.compare(password, user.hashedPassword), 'Incorrect Password');
                    return new account_1.default(user.webId);
                });
            }
            create(email, password, username, webID) {
                return __awaiter(this, void 0, void 0, function* () {
                    assert_1.default(!(yield fs_1.default.exists(this.userLocation(webID))), 'User already exists.');
                    const hashedPassword = yield bcryptjs_1.default.hash(password, SALT_ROUNDS);
                    yield fs_1.default.writeFile(this.userLocation(webID), JSON.stringify({
                        username,
                        webId: webID,
                        email,
                        externalWebId: '',
                        hashedPassword
                    }), { flag: 'w' });
                    yield fs_1.default.writeFile(this.userByEmailLocation(email), JSON.stringify({
                        id: this.userFileName(webID)
                    }), { flag: 'w' });
                });
            }
            changePassword(username, password) {
                return __awaiter(this, void 0, void 0, function* () {
                    const webID = yield config.webIdFromUsername(username);
                    const user = yield this.getUser(username);
                    user.hashedPassword = yield bcryptjs_1.default.hash(password, SALT_ROUNDS);
                    yield fs_1.default.writeFile(this.userLocation(webID), JSON.stringify(user), { flag: 'w' });
                });
            }
            userLocation(webID) {
                return path_1.default.join(config.storageData.folder, './oidc/users/users', `./_key_${this.userFileName(webID)}.json`);
            }
            userFileName(webID) {
                const webIDUrl = new URL(webID);
                return encodeURIComponent(`${webIDUrl.host}${webIDUrl.pathname}${webIDUrl.hash}`);
            }
            userByEmailLocation(email) {
                return path_1.default.join(config.storageData.folder, './oidc/users/users-by-email', `./_key_${encodeURIComponent(email)}.json`);
            }
            forgotPasswordLocation(name) {
                return path_1.default.join(config.storageData.folder, './oidc/users/forgot-password', `./_key_${name}.json`);
            }
            getUser(username) {
                return __awaiter(this, void 0, void 0, function* () {
                    const webID = yield config.webIdFromUsername(username);
                    try {
                        return JSON.parse((yield fs_1.default.readFile(this.userLocation(webID))).toString());
                    }
                    catch (err) {
                        return undefined;
                    }
                });
            }
            generateForgotPassword(username) {
                return __awaiter(this, void 0, void 0, function* () {
                    const user = yield this.getUser(username);
                    assert_1.default(user, 'The username does not exist.');
                    const forgotPasswordUUID = uuid_1.default.v4();
                    yield fs_1.default.writeFile(this.forgotPasswordLocation(forgotPasswordUUID), JSON.stringify({
                        username,
                        ex: new Date().getTime() + (1000 * 60 * 60 * 24)
                    }), { flag: 'w' });
                    return {
                        email: user.email,
                        uuid: forgotPasswordUUID
                    };
                });
            }
            getForgotPassword(uuid) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const forgotPasswordInfo = JSON.parse((yield fs_1.default.readFile(this.forgotPasswordLocation(uuid))).toString());
                        if (!forgotPasswordInfo || forgotPasswordInfo.ex < new Date().getTime()) {
                            return undefined;
                        }
                        return forgotPasswordInfo.username;
                    }
                    catch (err) {
                        return undefined;
                    }
                });
            }
            deleteForgotPassword(uuid) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield fs_1.default.unlink(this.forgotPasswordLocation(uuid));
                });
            }
        };
    });
}
exports.default = getFilesystemAccount;
//# sourceMappingURL=filesystemAccount.js.map
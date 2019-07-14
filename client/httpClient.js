"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fetch = require("node-fetch");
var trsa = require("trsa");
exports.rsa = trsa;
var RsaFetch = /** @class */ (function () {
    function RsaFetch(keyPair, serverUrl, serverKey) {
        this.keyPair = keyPair;
        this.serverUrl = serverUrl;
        this.serverKey = serverKey;
    }
    RsaFetch.prototype.fetch = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var requestData, encrypted, signature, r, respone, message, _a, decryptedMessage, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        requestData = JSON.stringify(__assign({ senderKey: this.keyPair.publicKey, method: 'GET', mode: 'cors' }, (typeof request === 'string' ? { url: request } : request)));
                        encrypted = exports.rsa.encrypt(requestData, this.serverKey);
                        signature = exports.rsa.sign(requestData, this.keyPair.privateKey);
                        return [4 /*yield*/, fetch(this.serverUrl, {
                                method: 'POST',
                                headers: __assign({}, request.headers || {}, { signature: signature }),
                                body: bytesFromHex(encrypted)
                            })];
                    case 1:
                        r = _b.sent();
                        respone = undefined;
                        if (!r.headers.has('Encrypted')) return [3 /*break*/, 3];
                        _a = hexFromArrayBuffer;
                        return [4 /*yield*/, r.arrayBuffer()];
                    case 2:
                        message = _a.apply(void 0, [_b.sent()]);
                        decryptedMessage = exports.rsa.decrypt(message, this.keyPair.privateKey);
                        try {
                            respone = JSON.parse(decryptedMessage);
                        }
                        catch (_c) {
                            respone = decryptedMessage;
                        }
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, r.text()];
                    case 4:
                        message = _b.sent();
                        try {
                            respone = JSON.parse(message);
                        }
                        catch (_d) {
                            respone = message;
                        }
                        _b.label = 5;
                    case 5:
                        if (r.ok) {
                            return [2 /*return*/, respone];
                        }
                        else {
                            throw new Error(respone);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return RsaFetch;
}());
exports.RsaFetch = RsaFetch;
function bytesFromHex(hex) {
    return new Uint8Array(hex
        .match(/.{2}/g)
        .map(function (e) { return parseInt(e, 16); }));
}
function pad(n, width, z) {
    if (z === void 0) { z = '0'; }
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function hexFromArrayBuffer(buf) {
    return uIntArrayToArray(new Uint8Array(buf))
        .map(function (v) { return pad(v.toString(16), 2); })
        .join('');
}
function uIntArrayToArray(arr) {
    var out = [];
    arr.forEach(function (v) { return out.push(v); });
    return out;
}
exports.utils = {
    bytesFromHex: bytesFromHex,
    hexFromArrayBuffer: hexFromArrayBuffer
};

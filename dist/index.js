var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
import io from 'socket.io-client';
var SpeaqrSDK = /** @class */ (function () {
    function SpeaqrSDK(apiKey) {
        this.publicApi = "http://apispeaqr.feelingdevs.com:8080";
        this.apiKey = apiKey;
        this.socket = io('ws://apispeaqr.feelingdevs.com:8080', {
            auth: {
                token: apiKey
            }
        });
        this.socket.on('connect', function () {
            console.log('Connected to socket server');
        });
        this.socket.on('disconnect', function () {
            console.log('Disconnected from socket server');
        });
        this.socket.on('transcription', function (data) {
            console.log('Transcription:', data);
        });
        this.socket.on('speech_to_text', function (data) {
            console.log('Speech to Text 1️⃣:', data);
        });
        this.socket.on('translation', function (data) {
            console.log('Translated Text 2️⃣:', data);
        });
        this.socket.on('text_to_speech', function (data) {
            console.log('Text to Speech 3️⃣', data);
        });
        this.socket.on('streaming_transcription', function (data) {
            console.log('Live Stream Transcription 3️⃣', data);
        });
        this.socket.on('error', function (error) {
            console.error('Socket error:', error);
        });
    }
    // Connect to streaming audio
    SpeaqrSDK.prototype.connect = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.socket.emit('live.connect', params, function (response) {
                if (response.error) {
                    reject(response.error);
                }
                else {
                    resolve(response);
                }
            });
        });
    };
    // Disconnect from streaming audio
    SpeaqrSDK.prototype.disconnect = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.socket.emit('disconnect_stream', function () {
                resolve();
            });
        });
    };
    // Send audio chunk
    SpeaqrSDK.prototype.sendAudioChunk = function (audioChunk) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.socket.emit('send_audio', audioChunk, function (response) {
                if (response.error) {
                    reject(response.error);
                }
                else {
                    resolve(response);
                }
            });
        });
    };
    // Add event listener
    SpeaqrSDK.prototype.addListener = function (event, callback) {
        this.socket.on(event, callback);
    };
    // Remove event listener
    SpeaqrSDK.prototype.removeListener = function (event, callback) {
        this.socket.off(event, callback);
    };
    // List supported languages
    SpeaqrSDK.prototype.listLanguages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.publicApi, "/languages"), {
                            headers: { 'x-api-key': "".concat(this.apiKey) }
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    return SpeaqrSDK;
}());
export default SpeaqrSDK;

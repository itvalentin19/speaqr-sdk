var io = require('socket.io-client');
class SpeaqrSDK {
    apiKey;
    socket;
    publicApi = "http://127.0.0.1:8080";
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.socket = io('ws://127.0.0.1:8080', {
            auth: {
                token: apiKey
            }
        });
        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });
        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
        this.socket.on('transcription', (data) => {
            console.log('Transcription:', data);
        });
        this.socket.on('speech_to_text', (data) => {
            console.log('Speech to Text 1️⃣:', data);
        });
        this.socket.on('translation', (data) => {
            console.log('Translated Text 2️⃣:', data);
        });
        this.socket.on('text_to_speech', (data) => {
            console.log('Text to Speech 3️⃣', data);
        });
        this.socket.on('streaming_transcription', (data) => {
            console.log('Live Stream Transcription 3️⃣', data);
        });
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }
    // Connect to streaming audio
    connect(params) {
        return new Promise((resolve, reject) => {
            this.socket.emit('connect_stream', params, (response) => {
                if (response.error) {
                    reject(response.error);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
    // Disconnect from streaming audio
    disconnect() {
        return new Promise((resolve) => {
            this.socket.emit('disconnect_stream', () => {
                resolve();
            });
        });
    }
    // Send audio chunk
    sendAudioChunk(audioData) {
        return new Promise((resolve, reject) => {
            this.socket.emit('send_audio', audioData, (response) => {
                if (response.error) {
                    reject(response.error);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
    // Add event listener
    addListener(event, callback) {
        this.socket.on(event, callback);
    }
    // Remove event listener
    removeListener(event, callback) {
        this.socket.off(event, callback);
    }
    // List supported languages
    async listLanguages() {
        const response = await fetch(`${this.publicApi}/languages`, {
            headers: { 'x-api-key': `${this.apiKey}` }
        });
        const result = await response.json();
        if (!result.error) {
            return result;
        } else {
            return [];
        }
    }
}
module.exports = SpeaqrSDK;

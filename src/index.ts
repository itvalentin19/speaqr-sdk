import io from 'socket.io-client';

class SpeaqrSDK {
    apiKey: string;
    socket: any;
    publicApi: string = "http://apispeaqr.feelingdevs.com:8080";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.socket = io('ws://apispeaqr.feelingdevs.com:8080', {
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
        this.socket.on('transcription', (data: any) => {
            console.log('Transcription:', data);
        });
        this.socket.on('speech_to_text', (data: any) => {
            console.log('Speech to Text 1️⃣:', data);
        });
        this.socket.on('translation', (data: any) => {
            console.log('Translated Text 2️⃣:', data);
        });
        this.socket.on('text_to_speech', (data: any) => {
            console.log('Text to Speech 3️⃣', data);
        });
        this.socket.on('streaming_transcription', (data: any) => {
            console.log('Live Stream Transcription 3️⃣', data);
        });
        this.socket.on('error', (error: any) => {
            console.error('Socket error:', error);
        });
    }

    // Connect to streaming audio
    connect(params: any) {
        return new Promise((resolve, reject) => {
            this.socket.emit('connect_stream', params, (response: any) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // Disconnect from streaming audio
    disconnect() {
        return new Promise<void>((resolve) => {
            this.socket.emit('disconnect_stream', () => {
                resolve();
            });
        });
    }

    // Send audio chunk
    sendAudioChunk(audioChunk: any) {
        return new Promise((resolve, reject) => {
            this.socket.emit('send_audio', audioChunk, (response: any) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // Add event listener
    addListener(event: string, callback: (...args: any[]) => void) {
        this.socket.on(event, callback);
    }

    // Remove event listener
    removeListener(event: string, callback: (...args: any[]) => void) {
        this.socket.off(event, callback);
    }

    // List supported languages
    async listLanguages() {
        const response = await fetch(`${this.publicApi}/languages`, {
            headers: { 'x-api-key': `${this.apiKey}` }
        });
        return response.json();
    }
}

export default SpeaqrSDK;

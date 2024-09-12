import io from 'socket.io-client';
import AudioParams from "./types/AudioParams";

class SpeaqrSDK {
    apiKey: string;
    socket: any;
    publicApi: string = "http://apispeaqr.feelingdevs.com:8080";
    events: string[] = ['connect', 'connect_error', 'disconnect', 'transcription', 'speech_to_text', 'translation', 'text_to_speech', 'text_to_speech_streaming', 'streaming_transcription', 'socket_server_connected', 'socket_server_disconnected', 'error'];
    isConnected: boolean = false;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.socket = io('ws://apispeaqr.feelingdevs.com:8080', {
            auth: {
                token: apiKey
            }
        });
        this.socket.on('connect', () => {
            // console.log('Connected to socket server');
        });
        this.socket.on('connect_error', (error: any) => {
            console.error('Connection error:', JSON.parse(error.message)); // { code: "bad_authentication", description: "Cuando se le pasa un apikey no válido" }
        });
        this.socket.on('disconnect', () => {
            // console.log('Disconnected from socket server');
        });
        this.socket.on('transcription', (data: any) => {
            // console.log('Transcription:', data);
        });
        this.socket.on('speech_to_text', (data: any) => {
            // console.log('Speech to Text 1️⃣:', data);
        });
        this.socket.on('translation', (data: any) => {
            // console.log('Translated Text 2️⃣:', data);
        });
        this.socket.on('text_to_speech', (data: any) => {
            // console.log('Text to Speech 3️⃣', data);
        });
        this.socket.on('text_to_speech_streaming', function (data: any) {
            // console.log('Text to Speech Streaming 4️⃣', data);
        });
        this.socket.on('streaming_transcription', function (data: any) {
            // console.log('Live Stream Transcription 5️⃣', data);
        });
        this.socket.on('socket_server_connected', () => {
            // console.log('Scoket Server Connected 👌');
        });
        this.socket.on('socket_server_disconnected', () => {
            // console.log('Scoket Server Disconnected 👎');
        });
        this.socket.on('error', (error: any) => {
            console.error('Socket error:', error);
        });
    }

    // Initialize the socket service
    connect(params: AudioParams) {
        return new Promise((resolve, reject) => {
            this.socket.emit('live.connect', params, (response: any) => {
                if (response.error) {
                    /**
                     * If the source language `params.languageIdSource` is not available
                     * response = {
                            "success": false,
                            "error": true,
                            "code": "source_language_not_supported",
                            "description": "Se le pasa un idioma de origen no soportado"
                        }

                        If the target language `params.languageIdTarget` is not available
                        response = {
                            "success": false,
                            "error": true,
                            "code": "target_language_not_supported",
                            "description": "Se le pasa un idioma de destino no soportado"
                        }
                     */
                    this.isConnected = false;
                    reject(response);
                } else {
                    this.isConnected = true;
                    resolve(response);
                }
            });
        });
    }

    // Disconnect socket service
    disconnect() {
        return new Promise<void>((resolve) => {
            this.socket.disconnect();
            resolve();
        })
    }

    // Disconnect from streaming audio
    connectStream() {
        return new Promise<void>((resolve, reject) => {
            this.socket.emit('connect_stream', (response: any) => {
                if (response.error) {
                    reject(response);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // Disconnect from streaming audio
    sendStream(data: any) {
        return new Promise<void>((resolve, reject) => {
            this.socket.emit('write_stream', data, (response: any) => {
                if (response.error) {
                    reject(response);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // Disconnect from streaming audio
    disconnectStream() {
        return new Promise<void>((resolve) => {
            this.socket.emit('disconnect_stream', (response: any) => {
                resolve(response);
            });
        });
    }

    // Send audio chunk
    sendAudioChunk(audioChunk: AudioParams) {
        return new Promise((resolve, reject) => {
            this.socket.emit('send_audio', audioChunk, (response: any) => {
                if (response.error) {
                    /**
                     * If the source language `params.languageIdSource` is not available
                     * response = {
                            "success": false,
                            "error": true,
                            "code": "source_language_not_supported",
                            "description": "Se le pasa un idioma de origen no soportado"
                        }

                     * If the target language `params.languageIdTarget` is not available
                     *  response = {
                            "success": false,
                            "error": true,
                            "code": "target_language_not_supported",
                            "description": "Se le pasa un idioma de destino no soportado"
                        }

                        Another available error codes: "invalid_data_provided", "socket_server_not_connected", "processing_failed"
                     */
                    reject(response);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // Add event listener
    addListener(event: string, callback: (...args: any[]) => void) {
        if (this.events.includes(event) === false) {
            callback({ error: true, code: "listener_not_valid", description: "Cuando se pasa un listener que no está en la lista" });
        }
        if (typeof callback != "function") {
            throw (new Error("callback_is_not_a_function"))
        }
        this.socket.on(event, callback);
    }

    // Remove event listener
    removeListener(event: string, callback: (...args: any[]) => void) {
        if (this.events.includes(event) === false) {
            callback({ error: true, code: "listener_not_valid", description: "Cuando se pasa un listener que no está en la lista" });
        }
        if (typeof callback != "function") {
            throw (new Error("callback_is_not_a_function"))
        }
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

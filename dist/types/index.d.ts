import AudioParams from "./types/AudioParams";
declare class SpeaqrSDK {
    apiKey: string;
    socket: any;
    publicApi: string;
    events: string[];
    isConnected: boolean;
    constructor(apiKey: string);
    connect(params: AudioParams): Promise<unknown>;
    disconnect(): Promise<void>;
    connectStream(): Promise<void>;
    sendStream(data: any): Promise<void>;
    disconnectStream(): Promise<void>;
    sendAudioChunk(audioChunk: AudioParams): Promise<unknown>;
    addListener(event: string, callback: (...args: any[]) => void): void;
    removeListener(event: string, callback: (...args: any[]) => void): void;
    listLanguages(): Promise<any>;
}
export default SpeaqrSDK;
//# sourceMappingURL=index.d.ts.map
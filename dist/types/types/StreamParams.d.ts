import { ReceiveType } from "./ReceiveType";
import { SendType } from "./SendType";
import { Voice } from "./Voice";
export interface StreamParams {
    languageIdSource: string;
    languageIdTarget: string;
    send: SendType;
    receive: ReceiveType;
    urlStreaming: string;
    voice: Voice;
    end: boolean;
}
//# sourceMappingURL=StreamParams.d.ts.map
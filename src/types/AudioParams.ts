import { Buffer } from "buffer"
import { ReceiveType } from "./ReceiveType"
import { SendType } from "./SendType"
import { Voice } from "./Voice"

export default interface AudioParams {
    languageIdSource: string
    languageIdTarget: string
    send: SendType
    receive: ReceiveType
    file: Buffer | null
    voice: Voice
    end: boolean
    url: string | null
}
# Speaqr SDK

The Speaqr SDK provides a client interface to interact with the Speaqr public API using WebSocket for real-time audio streaming, speech-to-text, translation, and text-to-speech functionalities.

## Installation

You can install the Speaqr SDK via npm:

```bash
npm install speaqr-sdk
```

## Usage

### Importing the SDK

```javascript
// Import the SDK
import SpeaqrSDK from 'speaqr-sdk';

// Initialize with your API key
const apiKey = 'your_api_key';
const sdk = new SpeaqrSDK(apiKey);
```

### Connecting to Speaqr Server

```javascript
// Connect to Speaqr server
sdk.addListener('connect', () => {
    console.log('Connected to Speaqr server');
});

sdk.addListener('disconnect', () => {
    console.log('Disconnected from Speaqr server');
});
```

### Streaming Audio

```javascript
// Example of connecting to streaming audio
const data = {
  languageIdSource: "en-us",
  languageIdTarget: "es-es",
  send: 'streaming',
  receive: 'mp3',
  url: streamingUrl,
  voice: voice, // "M": Male, "F": Female, "N": Neutral
  end: true
}
await speaqrSDK.sendAudioChunk(data);
```

### Sending Audio Chunk

```javascript
// Example of sending audio chunk
const CHUNK_SIZE = 102400;
const chunkAudio = (arrayBuffer, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
    chunks.push(arrayBuffer.slice(i, i + chunkSize));
  }
  return chunks.map(chunk => Buffer.from(chunk));
};

const reader = new FileReader();
reader.onload = async () => {
  const arrayBuffer = reader.result;
  const audioChunks = chunkAudio(arrayBuffer, CHUNK_SIZE);
  audioChunks.forEach(async (chunk, index) => {
    const data = {
      languageIdSource: "en-us",
      languageIdTarget: "es-es",
      send: 'buffer',
      receive: 'mp3',
      file: chunk,
      voice: voice, // "M": Male, "F": Female, "N": Neutral
      end: index === audioChunks.length - 1
    }
    sdk.sendAudioChunk(data)
      .then(response => {
          console.log('Audio chunk sent:', response);
      })
      .catch(error => {
          console.error('Error sending audio chunk:', error);
      });
  });
};
reader.readAsArrayBuffer(audioData); // `audioData`
```

### Listing Supported Languages

```javascript
// Example of listing supported languages
sdk.listLanguages()
    .then(languages => {
        console.log('Supported languages:', languages);
    })
    .catch(error => {
        console.error('Error listing languages:', error);
    });
```

### Possible Events
`connect`: Emitted when connected to the socket server.
`disconnect`: Emitted when disconnected from the socket server.
`transcription`: Emitted when a transcription result is received.
`speech_to_text`: Emitted when speech is converted to text.
`translation`: Emitted when text translation is received.
`text_to_speech`: Emitted when text is converted to speech.
`streaming_transcription`: Emitted when live streaming transcription result is received.
`error`: Emitted when there is a socket error.

### Event Listeners

```javascript
// Example of adding and removing event listeners
const transcriptionHandler = (data) => {
    console.log('Transcription:', data);
};

sdk.addListener('transcription', transcriptionHandler);

// Remove event listener
sdk.removeListener('transcription', transcriptionHandler);
```
### How to retrieve api key?
Contact [developer](mailto:lucianvalentin119@gmail.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

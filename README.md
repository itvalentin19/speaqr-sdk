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
```

### Initialize
```javascript
// Initialize with your API key
const apiKey = 'your_api_key';
const sdk = new SpeaqrSDK(apiKey);
```

### Connecting to Speaqr Server
```javascript
// Connect to Speaqr server
sdk.connect({
  languageIdSource: "en-us",
  languageIdTarget: "es-es",
  send: 'buffer',
  receive: 'mp3',
  voice: "M", // "M": Male, "F": Female, "N": Neutral
}).then(res => {
  // Connected to service successfully
}).catch(err => {
  // Error occured due to source or target language is not correct.
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
})

sdk.addListener('connect_error', () => {
    console.log('Failed to connect Speaqr server');
    // { code: "bad_authentication", description: "Cuando se le pasa un apikey no válido" }
});

sdk.addListener('disconnect', () => {
    console.log('Disconnected from Speaqr server');
});
```

### Check connection status
```javascript
console.log(sdk.isConnected); // "true" or "false"
```

### Streaming Audio
#### Audio Streaming with URL
```javascript
// Example of connecting to streaming audio
const params = {
  languageIdSource: "en-us", // Can ignore this parameter in this function
  languageIdTarget: "es-es", // Can ignore this parameter in this function
  send: 'streaming', // Can ignore this parameter in this function
  receive: 'mp3', // Can ignore this parameter in this function
  url: streamingUrl, // Example URL: http://stream.live.vc.bbcmedia.co.uk/bbc_world_service
  voice: "M", // "M": Male, "F": Female, "N": Neutral
  end: true
}
sdk.sendAudioChunk(params)
.catch(err => {
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
});
```

#### Audio Streaming by recording
```javascript
const startRecording = () => {
  sdk.connectStream(); // Initialize the live stream service
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size) {
        sdk.sendStream(event.data); // Send audio data to the live stream service
      }
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    };

    mediaRecorder.start(1000);
  }).catch(error => {
    console.error('Error accessing microphone:', error);
  });
};
const stopRecording = () => {
  sdk.disconnectStream(); // Clear the live stream service
}
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
      languageIdSource: "en-us", // Can ignore this parameter in this function
      languageIdTarget: "es-es", // Can ignore this parameter in this function
      send: 'buffer', // Can ignore this parameter in this function
      receive: 'mp3', // Can ignore this parameter in this function
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

- `connect`: Emitted when connected to the socket server.
- `connect_error`: Emitted when connection failed due to invalid authentication token.
- `disconnect`: Emitted when disconnected from the socket server.
- `transcription`: Emitted when a transcription result is received.
- `speech_to_text`: Emitted when speech is converted to text.
- `translation`: Emitted when text translation is received.
- `text_to_speech`: Emitted when text is converted to speech.
- `streaming_transcription`: Emitted when live streaming transcription result is received.
- `socket_server_disconnected`: Emitted when the socket server which provides STT, translation, and TTS services is disconnected on API server.
- `error`: Emitted when there is a socket error.

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

import './App.css';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Buffer } from 'buffer';
import SpeaqrSDK from 'speaqr-sdk';

const SPEAQR_SDK_API_KEY = "9jCzHnrT4oe7JBrPz5STjd"; //"dxk9Rn7kCPbUYaEwyvNNsu" // 
var speaqrSDK = new SpeaqrSDK(SPEAQR_SDK_API_KEY);

function App() {
  const [audioData, setAudioData] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState('en-us');
  const [targetLanguage, setTargetLanguage] = useState('es-es');
  const [voice, setVoice] = useState('M');
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streamingUrl, setStreamingUrl] = useState("http://stream.live.vc.bbcmedia.co.uk/bbc_world_service"); // Example URL: http://stream.live.vc.bbcmedia.co.uk/bbc_world_service
  const [streamingTranscription, setStreamingTranscription] = useState(null);
  const CHUNK_SIZE = 102400;
  const mediaRecorder = useRef(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    speaqrSDK.connect({
      languageIdSource: sourceLanguage,
      languageIdTarget: targetLanguage,
      send: 'buffer',
      receive: 'mp3',
      voice: voice,
    })
    getLanguages();
  }, [sourceLanguage, targetLanguage, voice]);

  useEffect(() => {
    speaqrSDK.addListener('speech_to_text', handleSTTResult)
    speaqrSDK.addListener('text_to_speech', handleTTSResult)
    speaqrSDK.addListener('translation', handleTTTResult)
    speaqrSDK.addListener('streaming_transcription', handleStreamingResult)

    return () => {
      speaqrSDK.removeListener('speech_to_text', handleSTTResult)
      speaqrSDK.removeListener('text_to_speech', handleTTSResult)
      speaqrSDK.removeListener('translation', handleTTTResult)
      speaqrSDK.removeListener('streaming_transcription', handleStreamingResult)
    }
  }, [speaqrSDK, streamingTranscription]);

  useEffect(() => {
    if (audioData?.size) {
      sendAudio();
    }
  }, [mediaRecorder, audioData]);

  const handleTTTResult = (data) => {
    console.log("Translation result received:");
    console.log(data);
    setTranslation(data);
  }

  const handleStreamingResult = (data) => {
    console.log("Streaming Transcription result received:");
    console.log(data);
    if (streamingTranscription) {
      data = streamingTranscription + " " + data;
    }
    setStreamingTranscription(data);
  }

  const handleSTTResult = (data) => {
    console.log("STT result received:");
    console.log(data);
    setTranscription(data);
  }

  const handleTTSResult = (data) => {
    console.log("TTS result received:");
    console.log(data);
    const audioBlob = new Blob([data], { type: 'audio/wav' });
    setResultData(audioBlob);
  }

  const getLanguages = async () => {
    var langs = await speaqrSDK.listLanguages();
    console.log(langs);
    if (langs && Array.isArray(langs)) {
      setLanguages(langs);
    }
  }

  const handleAudioUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const audioBlob = new Blob([e.target?.result], { type: 'audio/wav' });
        setAudioData(audioBlob);
        console.log('Audio uploaded:', audioBlob);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const startRecording = () => {
    setRecording(true);
    speaqrSDK.connectStream();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size) {
          speaqrSDK.sendStream(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setRecording(false);
      };

      mediaRecorder.current.start(1000);
    }).catch(error => {
      console.error('Error accessing microphone:', error);
      setRecording(false);
    });
  };
  const stopRecording = () => {
    if (mediaRecorder?.current) {
      mediaRecorder.current.stop();
    }
    setRecording(false);
    speaqrSDK.disconnectStream();
  }
  const chunkAudio = (arrayBuffer, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
      chunks.push(arrayBuffer.slice(i, i + chunkSize));
    }
    return chunks.map(chunk => Buffer.from(chunk));
  };

  const sendAudio = (audioChuck = audioData) => {
    if (speaqrSDK && audioChuck) {
      try {
        // setLoading(true);
        console.log("audioChuck");
        console.log(audioChuck);

        const reader = new FileReader();
        reader.onload = async () => {
          const arrayBuffer = reader.result;
          const audioChunks = chunkAudio(arrayBuffer, CHUNK_SIZE);
          console.log(audioChunks.length);

          audioChunks.forEach(async (chunk, index) => {
            console.log('Audio chunk sent');
            const data = {
              languageIdSource: sourceLanguage,
              languageIdTarget: targetLanguage,
              send: 'buffer',
              receive: 'mp3',
              file: chunk,
              voice: voice,
              end: index === audioChunks.length - 1
            }
            await speaqrSDK.sendAudioChunk(data);
          });
        };
        reader.readAsArrayBuffer(audioChuck);
      } catch (error) {
        console.error('Error sending audio chunk:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    }
  };

  const sendStreamingURL = async () => {
    console.log(streamingUrl);
    if (speaqrSDK && streamingUrl) {
      try {
        const data = {
          languageIdSource: sourceLanguage,
          languageIdTarget: targetLanguage,
          send: 'streaming',
          receive: 'mp3',
          url: streamingUrl,
          voice: voice,
          end: true
        }
        await speaqrSDK.sendAudioChunk(data);
      } catch (error) {
        console.error('Error sending streaming url:', error);
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Speaqr SDK Demo</h1>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
          <label>
            Source Language:
            <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
              {languages?.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </label>
          <label>
            Target Language:
            <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {languages?.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </label>
          <label>
            Target Voice:
            <select value={voice} onChange={(e) => setVoice(e.target.value)}>
              <option value={"M"}>Male</option>
              <option value={"F"}>Female</option>
              <option value={"N"}>Neutral</option>
            </select>
          </label>
        </div>
        <div>
          {
            recording ?
              <button onClick={stopRecording}>Stop Recording</button>
              :
              <button onClick={startRecording}>Start Recording</button>
          }
          <input type="file" accept="audio/*" onChange={handleAudioUpload} />
          <button onClick={() => sendAudio()} disabled={!audioData}>Translate</button>
        </div>
        {audioData && (
          <audio controls key={URL.createObjectURL(audioData)}>
            <source src={URL.createObjectURL(audioData)} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        )}

        {transcription && (
          <div>
            <h4>Transcription Result:</h4>
            <p>{transcription}</p>
          </div>
        )}

        {translation && (
          <div>
            <h4>Translation Result:</h4>
            <p>{translation}</p>
          </div>
        )}

        <h4>Result Audio</h4>
        {
          loading && (
            <div className="spinner"></div>
          )
        }
        {loading === false && resultData && (
          <>
            <audio controls key={URL.createObjectURL(resultData)}>
              <source src={URL.createObjectURL(resultData)} type="audio/wav" />
            </audio>
          </>
        )}
        <hr style={{ width: '80%' }} />
        <div>
          <label>
            Streaming URL:
            <input value={streamingUrl} onChange={(e) => setStreamingUrl(e.target.value)} />
          </label>
          <button onClick={sendStreamingURL} disabled={!streamingUrl}>Submit URL</button>
        </div>

        {streamingTranscription && (
          <div>
            <h4>Stream Transcription Result:</h4>
            <p>{streamingTranscription}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

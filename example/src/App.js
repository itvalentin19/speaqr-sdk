import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Buffer } from 'buffer';
import SpeaqrSDK from 'speaqr-sdk';

const SPEAQR_SDK_API_KEY = "dxk9Rn7kCPbUYaEwyvNNsu";
var speaqrSDK = new SpeaqrSDK(SPEAQR_SDK_API_KEY);

function App() {
  const [audioData, setAudioData] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState('en-us');
  const [targetLanguage, setTargetLanguage] = useState('es-es');
  const [voice, setVoice] = useState('M');
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streamingUrl, setStreamingUrl] = useState("");
  const [streamingTranscription, setStreamingTranscription] = useState(null);
  const CHUNK_SIZE = 102400;

  useEffect(() => {
    getLanguages();
  }, []);

  useEffect(() => {
    speaqrSDK.addListener('speech_to_text', handleSTTResult)
    speaqrSDK.addListener('text_to_speech', handleTTSResult)
    speaqrSDK.addListener('streaming_transcription', handleStreamingResult)

    return () => {
      speaqrSDK.removeListener('speech_to_text', handleSTTResult)
      speaqrSDK.removeListener('text_to_speech', handleTTSResult)
      speaqrSDK.removeListener('streaming_transcription', handleStreamingResult)
    }
  }, [speaqrSDK]);

  const handleStreamingResult = (data) => {
    console.log("Streaming Transcription result received:");
    console.log(data);
    let text = streamingTranscription + " " + data;
    setStreamingTranscription(text);
  }

  const handleSTTResult = (data) => {
    console.log("TTS result received:");
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
    if (langs) {
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
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioData(audioBlob);
        console.log('Recording stopped:', audioBlob);
      };

      mediaRecorder.start();

      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 5000); // Stop recording after 5 seconds
    }).catch(error => {
      console.error('Error accessing microphone:', error);
    });
  };
  const chunkAudio = (arrayBuffer, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
      chunks.push(arrayBuffer.slice(i, i + chunkSize));
    }
    return chunks.map(chunk => Buffer.from(chunk));
  };

  const sendAudio = () => {
    console.log(audioData);
    if (speaqrSDK && audioData) {
      try {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async () => {
          const arrayBuffer = reader.result;
          const audioChunks = chunkAudio(arrayBuffer, CHUNK_SIZE);
          audioChunks.forEach(async (chunk, index) => {
            console.log('Audio chunk sent');
            console.log(chunk);
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
        reader.readAsArrayBuffer(audioData);
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
          <button onClick={startRecording}>Start Recording</button>
          <input type="file" accept="audio/*" onChange={handleAudioUpload} />
          <button onClick={sendAudio} disabled={!audioData}>Translate</button>
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

        <h4>Result Audio</h4>
        {
          loading && (
            <div class="spinner"></div>
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

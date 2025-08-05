import React, { useState, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Brain,
  Waves
} from 'lucide-react';
import Orb from './bits/Orb';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orbHover, setOrbHover] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sendToBackend = async (text: string) => {
    setIsProcessing(true);
    setResponse(null);
    setError(null);
    
    try {
      const res = await fetch('http://localhost:3000/api/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandText: text })
      });
      
      const data = await res.json();
      setResponse(data.message || data.response || 'Success');
    } catch (err: any) {
      setError('Failed to connect to backend');
    } finally {
      setIsProcessing(false);
      setTranscript('');
      setOrbHover(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }
    
    setOrbHover(true);

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setResponse(null);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          setTranscript(event.results[i][0].transcript);
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        
        //implementing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        
        //start
        silenceTimerRef.current = setTimeout(() => {
          recognition.stop();
          sendToBackend(finalTranscript.trim());
        }, 1000);
      }
    };

    recognition.onerror = () => {
      //setIsListening(false);
      setError('Speech recognition error');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

//why bother with UI, when I have claude, but I made some changes, added the orb

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        
        {/* IRIS Text */}
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              I R I S
            </h1>
        </div>
        
        {/* Orb and Content Container */}
        <div className="relative w-full max-w-2xl h-[500px] flex items-center justify-center">

          {/* Orb Component (Background) */}
          <div className="absolute inset-0 z-0">
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={3}
              forceHoverState={orbHover}
            />
          </div>

          {/* Original Content (Foreground) */}
          <div className="relative z-10 w-full max-w-lg p-8 rounded-3xl flex flex-col items-center justify-center space-y-6">
            
            {/* Microphone Button */}
            <div className="text-center">
              <button
                onClick={handleMicClick}
                disabled={isProcessing}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isProcessing
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/25'
                    : isListening
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95`}
              >
                {isProcessing ? (
                  <Loader2 className="w-12 h-12 animate-spin text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </button>
              
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">
                  {isProcessing
                    ? 'Sending to Backend...'
                    : isListening
                      ? 'Listening...'
                      : 'Ready to Listen'
                  }
                </h2>
                <p className="text-gray-400 text-sm">
                  {isProcessing
                    ? 'Processing with your backend'
                    : isListening
                      ? 'Speak now - will auto-send after silence'
                      : 'Click to start recording'
                  }
                </p>
              </div>
            </div>

            {/* Transcript Display */}
            <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl mb-6 min-h-[120px] w-full border border-white/5">
              {transcript ? (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Waves className="w-5 h-5 text-blue-400 animate-pulse" />
                    <span className="text-sm text-gray-400">Transcribed:</span>
                  </div>
                  <p className="text-lg text-white font-medium">"{transcript}"</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">
                    {isListening ? 'Listening... speak now' : 'Your speech will appear here'}
                  </p>
                </div>
              )}
            </div>

            {/* Response/Error Display */}
            {(response || error) && (
              <div className={`p-6 rounded-2xl w-full border ${
                error
                  ? 'bg-red-500/10 border-red-500/20 text-red-300'
                  : 'bg-green-500/10 border-green-500/20 text-green-300'
              }`}>
                <div className="flex items-start space-x-3">
                  {error ? <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{error ? 'Error:' : 'Response:'}</p>
                    <p className="text-sm">{error || response}</p>
                  </div>
                </div>
              </div>
            )}

            
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
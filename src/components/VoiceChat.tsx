import React, { useEffect, useState, useRef } from 'react';
import { useFormStore } from '../store/formStore';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, X, Loader2 } from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface VoiceChatProps {
  onClose: () => void;
}

export function VoiceChat({ onClose }: VoiceChatProps) {
  const store = useFormStore();
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    const initVapi = async () => {
      try {
        const apiKey = import.meta.env.VITE_VAPI_API_KEY;
        if (!apiKey) {
          throw new Error("Vapi API key is missing");
        }

        // Initialize Vapi client
        vapiRef.current = new Vapi(apiKey);

        // Test microphone access
        await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        setIsInitializing(false);
      } catch (error) {
        console.error("Error initializing Vapi:", error);
        if (error instanceof Error && error.name === 'NotAllowedError') {
          setError("Please allow microphone access to use voice chat");
        } else {
          setError(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        setIsInitializing(false);
      }
    };

    initVapi();

    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (e) {
          console.error("Error stopping Vapi:", e);
        }
      }
    };
  }, []);

  const startConversation = async () => {
    if (!vapiRef.current) {
      setError("Voice chat not initialized");
      return;
    }

    try {
      setIsListening(true);
      setError(null);

      // Set up event listeners
      vapiRef.current.on('speech-start', () => {
        console.log("Assistant speech started");
      });

      vapiRef.current.on('speech-end', () => {
        console.log("Assistant speech ended");
      });

      vapiRef.current.on('message', (message: any) => {
        if (message.type === 'transcript' && message.transcript) {
          setTranscript(message.transcript);
          if (message.isFinal) {
            setMessages(prev => [...prev, { role: message.turn, content: message.transcript }]);
            setTranscript('');
          }
        }
      });

      vapiRef.current.on('error', (error: any) => {
        console.error("Conversation error:", error);
        setError(`Error: ${error.message || 'Unknown error'}`);
        setIsListening(false);
      });

      // Start the conversation with configuration
      await vapiRef.current.start({
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US"
        },
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a product-led growth expert discussing Free Model Analyzer results.
              
Analysis Results:
PRODUCT: ${store.productDescription || 'Not specified'}
FREE MODEL TYPE: ${store.selectedModel || 'Not specified'}
STRENGTHS: ${store.analysis?.strengths.join(', ') || 'Not specified'}
WEAKNESSES: ${store.analysis?.weaknesses.join(', ') || 'Not specified'}

Keep responses concise and conversational as this is a voice interface.`
            },
            {
              role: "assistant",
              content: "Hi there! I'm your product strategy assistant. I've reviewed your Free Model Analysis results. What would you like to know?"
            }
          ]
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer"
        }
      });

    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError(`Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsListening(false);
    }
  };

  const stopConversation = async () => {
    if (!vapiRef.current) return;

    try {
      await vapiRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Failed to stop conversation:", error);
      setError(`Failed to stop: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleMute = () => {
    if (!vapiRef.current) return;
    
    try {
      const newMutedState = !isMuted;
      vapiRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    } catch (error) {
      console.error("Failed to toggle mute:", error);
      setError(`Failed to toggle mute: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#2A2A2A] rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-4 border-b border-[#333333]">
          <h2 className="text-xl font-semibold text-white">Voice Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="h-96 overflow-y-auto bg-[#1C1C1C] rounded-lg p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#FFD23F] text-[#1C1C1C]'
                      : 'bg-[#333333] text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isListening && transcript && (
              <div className="flex justify-end">
                <div className="max-w-[80%] p-3 rounded-lg bg-[#FFD23F]/50 text-[#1C1C1C]">
                  {transcript}...
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            {isInitializing ? (
              <div className="flex items-center space-x-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing voice chat...</span>
              </div>
            ) : (
              <>
                <button
                  onClick={isListening ? stopConversation : startConversation}
                  className={`p-4 rounded-full ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-[#FFD23F] hover:bg-[#FFD23F]/90'
                  }`}
                  disabled={!!error}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-[#1C1C1C]" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full ${
                    isMuted
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-[#333333] hover:bg-[#444444]'
                  }`}
                  disabled={!isListening || !!error}
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6 text-white" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white" />
                  )}
                </button>
              </>
            )}
          </div>

          <p className="text-center text-gray-400">
            {isInitializing ? (
              "Setting up voice chat..."
            ) : isListening ? (
              "Click the microphone to end the conversation"
            ) : (
              "Click the microphone to start talking"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
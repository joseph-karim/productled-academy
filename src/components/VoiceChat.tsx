import React, { useEffect, useState, useRef } from 'react';
import { useFormStore } from '../store/formStore';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, X, Loader2 } from 'lucide-react';
import { Vapi } from '@vapi-ai/web';

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
  const [isConnecting, setIsConnecting] = useState(false);
  
  const vapiRef = useRef<Vapi | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatAnalysisData = () => {
    if (!store.analysis) return '';

    const { deepScore, componentScores, strengths, weaknesses, recommendations } = store.analysis;

    return `
Product Description:
${store.productDescription}

Selected Free Model: ${store.selectedModel?.replace('-', ' ')}

DEEP Framework Scores:
- Desirability: ${deepScore.desirability}/10
- Effectiveness: ${deepScore.effectiveness}/10
- Efficiency: ${deepScore.efficiency}/10
- Polish: ${deepScore.polish}/10

Component Analysis:
- Product Description: ${componentScores.productDescription}/100
- User Endgame: ${componentScores.userEndgame}/100
- Challenges: ${componentScores.challenges}/100
- Solutions: ${componentScores.solutions}/100
- Model Selection: ${componentScores.modelSelection}/100
- Free Features: ${componentScores.freeFeatures}/100

Key Strengths:
${strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Areas for Improvement:
${weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Top Recommendations:
${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
  };

  useEffect(() => {
    const initVapi = async () => {
      try {
        const apiKey = import.meta.env.VITE_VAPI_API_KEY;
        if (!apiKey) {
          throw new Error("Vapi API key is missing");
        }

        // Initialize Vapi client
        vapiRef.current = new Vapi(apiKey);

        // Request microphone permission early
        await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        setIsInitializing(false);
        
        // Add welcome message
        setMessages([{
          role: 'assistant',
          content: "Hi! I've reviewed your Free Model Analysis. What aspect would you like to discuss - the overall scores, specific components, or implementation recommendations?"
        }]);

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
      setIsConnecting(true);
      setError(null);

      // Set up event listeners
      vapiRef.current.removeAllListeners(); // Clear any existing listeners

      vapiRef.current.on('speech-start', () => {
        console.log("Assistant speech started");
      });

      vapiRef.current.on('speech-end', () => {
        console.log("Assistant speech ended");
      });

      vapiRef.current.on('transcript', (message: any) => {
        if (message.transcript) {
          setTranscript(message.transcript);
          if (message.isFinal) {
            setMessages(prev => [...prev, { role: 'user', content: message.transcript }]);
            setTranscript('');
          }
        }
      });

      vapiRef.current.on('message', (message: any) => {
        if (message.content) {
          setMessages(prev => [...prev, { role: 'assistant', content: message.content }]);
        }
      });

      vapiRef.current.on('error', (error: any) => {
        console.error("Conversation error:", error);
        setError(`Error: ${error.message || 'Unknown error'}`);
        setIsListening(false);
      });

      // Start the conversation
      await vapiRef.current.start({
        model: {
          provider: "openai",
          model: "gpt-4",
          temperature: 0.7,
          systemPrompt: `You are an expert product-led growth consultant specializing in free model strategy. You're having a voice conversation with a user about their Free Model Analysis results.

Analysis Context:
${formatAnalysisData()}

Key Focus Areas:
1. DEEP Score Analysis
   - Component strengths and weaknesses
   - Improvement opportunities
   - Score correlations

2. Free Model Strategy
   - Feature selection and limitations
   - Upgrade triggers
   - Value demonstration

3. Implementation Priorities
   - Quick wins vs strategic changes
   - Resource allocation
   - Success metrics

Remember to:
1. Keep responses concise (2-3 sentences)
2. Use a conversational, friendly tone
3. Ask clarifying questions when needed
4. Reference specific metrics and scores
5. Provide concrete examples and next steps`
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
          speed: 1.0
        },
        audio: {
          disconnect: {
            silenceTimeout: 2000
          }
        }
      });

      setIsListening(true);
      setIsConnecting(false);

    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError(`Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsListening(false);
      setIsConnecting(false);
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
          <h2 className="text-xl font-semibold text-white">PLG Strategy Assistant</h2>
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

          {isInitializing ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="w-8 h-8 text-[#FFD23F] animate-spin" />
              <p className="text-gray-400">Initializing voice chat...</p>
            </div>
          ) : (
            <>
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
                <div ref={messagesEndRef} />
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={isListening ? stopConversation : startConversation}
                  disabled={!!error || isConnecting}
                  className={`p-4 rounded-full ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : isConnecting
                      ? 'bg-[#333333] cursor-not-allowed'
                      : 'bg-[#FFD23F] hover:bg-[#FFD23F]/90'
                  }`}
                >
                  {isConnecting ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  ) : isListening ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-[#1C1C1C]" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  disabled={!isListening || !!error}
                  className={`p-4 rounded-full ${
                    isMuted
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-[#333333] hover:bg-[#444444]'
                  }`}
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6 text-white" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>

              <p className="text-center text-gray-400">
                {isConnecting ? (
                  "Connecting to voice chat..."
                ) : isListening ? (
                  "Click the microphone to end the conversation"
                ) : (
                  "Click the microphone to start talking"
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
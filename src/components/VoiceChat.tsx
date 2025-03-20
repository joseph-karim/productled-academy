import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Loader2, Bot, AlertCircle } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { useFormStore } from '../store/formStore';

interface VoiceChatProps {
  onClose: () => void;
  floating?: boolean;
}

export function VoiceChat({ onClose, floating = false }: VoiceChatProps) {
  const store = useFormStore();
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format analysis data for the prompt
  const formatAnalysisData = () => {
    if (!store.analysis) return '';

    const { deepScore, componentScores, strengths, weaknesses, recommendations } = store.analysis;

    // Format package features
    const freeFeatures = store.packageStore?.features
      .filter(f => f.tier === 'free')
      .map(f => `- ${f.name}: ${f.description} (${f.category})`)
      .join('\n');

    const paidFeatures = store.packageStore?.features
      .filter(f => f.tier === 'paid')
      .map(f => `- ${f.name}: ${f.description} (${f.category})`)
      .join('\n');

    const strategy = store.packageStore?.pricingStrategy;

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
- Package Design: ${componentScores.packageDesign}/100
- Pricing Strategy: ${componentScores.pricingStrategy}/100

Package Design:
Free Features:
${freeFeatures}

Paid Features:
${paidFeatures}

Pricing Strategy:
- Model: ${strategy?.model}
- Basis: ${strategy?.basis}
- Free Package Limitations: ${strategy?.freePackage.limitations.join(', ')}
- Conversion Goals: ${strategy?.freePackage.conversionGoals.join(', ')}
- Value Metrics: ${strategy?.paidPackage.valueMetrics.join(', ')}
- Target Conversion: ${strategy?.paidPackage.targetConversion}%

Key Strengths:
${strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Areas for Improvement:
${weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Top Recommendations:
${recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
  };

  useEffect(() => {
    const initVapi = async () => {
      try {
        const apiKey = import.meta.env.VITE_VAPI_API_KEY;
        if (!apiKey) throw new Error("Vapi API key is missing");

        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (micError) {
          throw new Error("Please allow microphone access to use voice chat");
        }

        vapiRef.current = new Vapi(apiKey);
        setIsInitializing(false);
        
        setMessages([{
          role: 'assistant',
          content: "Hi! I've reviewed your Free Model Analysis. What aspect would you like to discuss - the overall scores, package design, pricing strategy, or implementation recommendations?"
        }]);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to initialize');
        setIsInitializing(false);
      }
    };

    initVapi();
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
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

      await vapiRef.current.start({
        model: {
          provider: "openai",
          model: "gpt-4",
          temperature: 0.7,
          systemPrompt: `You are an expert product-led growth consultant specializing in free model strategy. You're having a voice conversation with a user about their Free Model Analysis results.

Analysis Context:
${formatAnalysisData()}

Key Focus Areas:
1. Package Design
   - Feature balance and distribution
   - Value demonstration
   - Upgrade triggers
   - User journey alignment

2. Pricing Strategy
   - Model fit and effectiveness
   - Conversion potential
   - Value metrics
   - Target conversion rates

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
        }
      });

      setIsListening(true);
    } catch (error) {
      // Handle Vapi credits error specifically
      if (error instanceof Error && error.message.includes('Wallet Balance')) {
        setError("Voice chat is temporarily unavailable. Please try again later.");
      } else {
        setError(`Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setIsListening(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const stopConversation = async () => {
    if (!vapiRef.current) return;
    try {
      await vapiRef.current.stop();
      setIsListening(false);
    } catch (error) {
      setError(`Failed to stop: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleMute = () => {
    if (!vapiRef.current) return;
    const newMutedState = !isMuted;
    vapiRef.current.setMuted(newMutedState);
    setIsMuted(newMutedState);
  };

  if (isInitializing) {
    return (
      <div className={`flex items-center justify-center ${floating ? 'h-40' : 'min-h-[400px]'}`}>
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD23F]" />
          <p className="text-gray-400">Initializing voice chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${floating ? 'p-4' : 'p-6 space-y-4'}`}>
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded flex items-start mb-4">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className={`space-y-4 ${floating ? 'h-40' : 'h-96'} overflow-y-auto mb-16`}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-[#FFD23F] text-[#1C1C1C]'
                  : 'bg-[#1C1C1C] text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {transcript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] p-3 rounded-lg bg-[#FFD23F]/50 text-[#1C1C1C]">
              {transcript}...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#2A2A2A] p-4 border-t border-[#333333]">
        <div className="flex flex-col items-center space-y-4">
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

          <p className="text-center text-gray-400 text-sm">
            {isConnecting ? (
              "Connecting to voice chat..."
            ) : isListening ? (
              "Click the microphone to end the conversation"
            ) : (
              "Click the microphone to start talking"
            )}
          </p>

          {/* ReviveAgent Badge */}
          <div className="mt-2 pt-2 border-t border-[#333333] w-full">
            <div className="flex justify-center">
              <a 
                href="https://www.reviveagent.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-xs text-[#4C6FFF] hover:text-[#4C6FFF]/80 transition-colors"
              >
                <span>Powered by</span>
                <Bot className="w-4 h-4 text-[#4C6FFF]" />
                <span>Revive Agent</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
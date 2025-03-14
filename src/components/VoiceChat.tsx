import React, { useEffect, useState, useRef } from 'react';
import { useFormStore } from '../store/formStore';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, X, Loader2 } from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface VoiceChatProps {
  onClose: () => void;
}

interface LoadingState {
  microphone: boolean;
  analysis: boolean;
  initialization: boolean;
}

interface AnalysisStatus {
  productDescription: boolean;
  selectedModel: boolean;
  deepScore: boolean;
  strengths: boolean;
  weaknesses: boolean;
  recommendations: boolean;
  componentScores: boolean;
  userJourney: boolean;
}

export function VoiceChat({ onClose }: VoiceChatProps) {
  const store = useFormStore();
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingState>({
    microphone: true,
    analysis: true,
    initialization: true
  });
  const [progress, setProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>({
    productDescription: false,
    selectedModel: false,
    deepScore: false,
    strengths: false,
    weaknesses: false,
    recommendations: false,
    componentScores: false,
    userJourney: false
  });
  
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    const totalSteps = 3;
    const completedSteps = Object.values(loadingStates).filter(state => !state).length;
    setProgress((completedSteps / totalSteps) * 100);
  }, [loadingStates]);

  useEffect(() => {
    console.log('Checking analysis data...', {
      productDescription: !!store.productDescription,
      selectedModel: !!store.selectedModel,
      analysis: !!store.analysis,
      userJourney: !!store.userJourney,
      deepScore: !!store.analysis?.deepScore,
      strengths: !!store.analysis?.strengths,
      weaknesses: !!store.analysis?.weaknesses,
      recommendations: !!store.analysis?.recommendations,
      componentScores: !!store.analysis?.componentScores
    });

    const newStatus = {
      productDescription: !!store.productDescription,
      selectedModel: !!store.selectedModel,
      deepScore: !!store.analysis?.deepScore,
      strengths: Array.isArray(store.analysis?.strengths),
      weaknesses: Array.isArray(store.analysis?.weaknesses),
      recommendations: Array.isArray(store.analysis?.recommendations),
      componentScores: !!store.analysis?.componentScores,
      userJourney: !!store.userJourney
    };

    setAnalysisStatus(newStatus);

    const allDataReady = Object.values(newStatus).every(status => status);
    console.log('Analysis data ready:', allDataReady);

    setLoadingStates(prev => ({
      ...prev,
      analysis: !allDataReady
    }));
  }, [store.productDescription, store.selectedModel, store.analysis, store.userJourney]);

  useEffect(() => {
    const initVapi = async () => {
      try {
        const apiKey = import.meta.env.VITE_VAPI_API_KEY;
        if (!apiKey) {
          throw new Error("Vapi API key is missing");
        }

        vapiRef.current = new Vapi(apiKey);

        await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        setLoadingStates(prev => ({
          ...prev,
          microphone: false
        }));

        setTimeout(() => {
          setLoadingStates(prev => ({
            ...prev,
            initialization: false
          }));
        }, 1000);

      } catch (error) {
        console.error("Error initializing Vapi:", error);
        if (error instanceof Error && error.name === 'NotAllowedError') {
          setError("Please allow microphone access to use voice chat");
        } else {
          setError(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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

  const formatAnalysisData = () => {
    if (!store.analysis) return '';

    const { deepScore, componentScores, strengths, weaknesses, recommendations } = store.analysis;

    const deepScores = `DEEP Framework Scores:
- Desirability: ${deepScore.desirability}/10
- Effectiveness: ${deepScore.effectiveness}/10
- Efficiency: ${deepScore.efficiency}/10
- Polish: ${deepScore.polish}/10
Overall: ${((deepScore.desirability + deepScore.effectiveness + deepScore.efficiency + deepScore.polish) / 4).toFixed(1)}/10`;

    const components = `Component Analysis:
- Product Description: ${componentScores.productDescription}/100
- User Endgame: ${componentScores.userEndgame}/100
- Challenges: ${componentScores.challenges}/100
- Solutions: ${componentScores.solutions}/100
- Model Selection: ${componentScores.modelSelection}/100
- Free Features: ${componentScores.freeFeatures}/100`;

    const strengthsList = strengths.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const weaknessesList = weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n');
    const recommendationsList = recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');

    const userJourney = store.userJourney ? `
User Journey Analysis:

1. Discovery
- Initial Problem: ${store.userJourney.discovery.problem}
- Trigger Event: ${store.userJourney.discovery.trigger}
- First Impression: ${store.userJourney.discovery.initialThought}

2. Sign Up Experience
- Friction Level: ${store.userJourney.signup.friction}
- Time to Value: ${store.userJourney.signup.timeToValue}
- Onboarding Support: ${store.userJourney.signup.guidance.join(', ')}

3. Activation
- First Win: ${store.userJourney.activation.firstWin}
- "Aha" Feature: ${store.userJourney.activation.ahaFeature}
- Success Timeline: ${store.userJourney.activation.timeToSuccess}

4. Engagement
- Core Tasks: ${store.userJourney.engagement.coreTasks.join(', ')}
- Collaboration Features: ${store.userJourney.engagement.collaboration.join(', ')}
- Current Limitations: ${store.userJourney.engagement.limitations.join(', ')}

5. Conversion Triggers
- Upgrade Motivators: ${store.userJourney.conversion.triggers.join(', ')}
- Premium Features: ${store.userJourney.conversion.nextFeatures.join(', ')}` : '';

    const freeFeatures = store.freeFeatures.length > 0 ? `
Free Tier Features:
${store.freeFeatures.map(f => `- ${f.name}: ${f.description}`).join('\n')}` : '';

    return `
Product Description:
${store.productDescription}

Selected Free Model: ${store.selectedModel?.replace('-', ' ')}

${deepScores}

${components}

Key Strengths:
${strengthsList}

Areas for Improvement:
${weaknessesList}

Top Recommendations:
${recommendationsList}

${userJourney}

${freeFeatures}`;
  };

  const startConversation = async () => {
    if (!vapiRef.current) {
      setError("Voice chat not initialized");
      return;
    }

    try {
      setIsListening(true);
      setError(null);

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

      await vapiRef.current.start({
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US"
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an expert product-led growth consultant specializing in free model strategy. You're having a voice conversation with a user about their Free Model Analysis results and user journey.

Your Expertise:
- Deep knowledge of freemium, free trial, and product-led growth strategies
- Understanding of the DEEP framework (Desirability, Effectiveness, Efficiency, Polish)
- Expertise in user journey optimization and conversion triggers
- Focus on practical, implementable advice

Voice Interaction Guidelines:
- Keep responses concise (2-3 sentences)
- Use a conversational, friendly tone
- Ask clarifying questions when needed
- Reference specific metrics, scores, and journey touchpoints
- Provide concrete examples and next steps

Analysis Context:
${formatAnalysisData()}

Key Focus Areas:
1. User Journey Optimization
   - Discovery to conversion flow
   - Friction points and solutions
   - Time-to-value optimization

2. Free Model Strategy
   - Feature selection and limitations
   - Upgrade triggers
   - Value demonstration

3. Implementation Priorities
   - Quick wins vs strategic changes
   - Resource allocation
   - Success metrics

Remember to:
1. Start by highlighting key insights from both the analysis and user journey
2. Let the user guide the conversation focus
3. Connect journey touchpoints to DEEP scores
4. End each response with a clear next step or follow-up question`
            },
            {
              role: "assistant",
              content: "Hi! I've reviewed your Free Model Analysis and user journey mapping in detail. I see some interesting patterns in how your DEEP scores align with your user touchpoints. What aspect would you like to discuss first - the analysis results or specific journey stages?"
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

  const isReady = !Object.values(loadingStates).some(state => state);

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

          {!isReady && !error && (
            <div className="bg-[#1C1C1C] p-6 rounded-lg space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Initializing voice chat...</span>
                  <span className="text-[#FFD23F]">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-[#333333] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FFD23F] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {loadingStates.microphone ? (
                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 text-green-500">✓</div>
                  )}
                  <span className={loadingStates.microphone ? "text-gray-500" : "text-gray-300"}>
                    Checking microphone access
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    {loadingStates.analysis ? (
                      <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 text-green-500">✓</div>
                    )}
                    <span className={loadingStates.analysis ? "text-gray-500" : "text-gray-300"}>
                      Loading analysis data
                    </span>
                  </div>
                  
                  {loadingStates.analysis && (
                    <div className="ml-7 space-y-1 text-xs">
                      {Object.entries(analysisStatus).map(([key, ready]) => (
                        <div key={key} className="flex items-center space-x-2">
                          {ready ? (
                            <div className="w-3 h-3 text-green-500">✓</div>
                          ) : (
                            <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />
                          )}
                          <span className={ready ? "text-gray-300" : "text-gray-500"}>
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {loadingStates.initialization ? (
                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 text-green-500">✓</div>
                  )}
                  <span className={loadingStates.initialization ? "text-gray-500" : "text-gray-300"}>
                    Initializing voice assistant
                  </span>
                </div>
              </div>
            </div>
          )}

          {isReady && (
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
              </div>

              <div className="flex justify-center space-x-4">
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
              </div>

              <p className="text-center text-gray-400">
                {isListening ? (
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
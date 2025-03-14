import React from 'react';
import { useFormStore } from '../store/formStore';
import { MessageSquare, Send, ArrowRight, AlertCircle, Loader2, Mic, ChevronDown, ChevronUp } from 'lucide-react';
import { VoiceChat } from './VoiceChat';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { analyzeFormData, getAnalysisResponse } from '../services/ai';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export function Analysis() {
  const store = useFormStore();
  const [message, setMessage] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    componentAnalysis: false,
    actionPlan: false,
    testing: false
  });
  const [showVoiceChat, setShowVoiceChat] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<{
    deepScore: {
      desirability: number;
      effectiveness: number;
      efficiency: number;
      polish: number;
    };
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    componentScores: {
      productDescription: number;
      userEndgame: number;
      challenges: number;
      solutions: number;
      modelSelection: number;
      freeFeatures: number;
    };
    actionPlan: {
      immediate: string[];
      medium: string[];
      long: string[];
    };
    testing: {
      abTests: string[];
      metrics: string[];
    };
  } | null>(null);
  const [isTyping, setIsTyping] = React.useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const analyzeData = async () => {
      const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';
      
      if (!store.productDescription || !beginnerOutcome || !store.selectedModel) {
        setIsAnalyzing(false);
        setError("Please complete all previous sections before viewing the analysis.");
        return;
      }

      try {
        const result = await analyzeFormData(
          store.productDescription,
          beginnerOutcome,
          store.challenges,
          store.solutions,
          store.selectedModel,
          store.freeFeatures
        );
        setAnalysis(result);
        setError(null);
      } catch (error) {
        console.error('Error analyzing data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeData();
  }, [store.productDescription, store.outcomes, store.challenges, store.solutions, store.selectedModel, store.freeFeatures]);

  const handleSendMessage = async () => {
    if (!message.trim() || !analysis) return;

    const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';
    const newHistory = [...chatHistory, { role: 'user' as const, content: message }];
    setChatHistory(newHistory);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await getAnalysisResponse(message, {
        productDescription: store.productDescription,
        userEndgame: beginnerOutcome,
        challenges: store.challenges,
        solutions: store.solutions,
        selectedModel: store.selectedModel!,
        freeFeatures: store.freeFeatures,
        analysis
      });

      setChatHistory([...newHistory, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setChatHistory([
        ...newHistory,
        { 
          role: 'assistant', 
          content: "I apologize, but I'm having trouble processing your question right now. Please try again." 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD23F]" />
          <p className="text-gray-400">Analyzing your product strategy...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
          <p className="text-gray-400">
            {error || "Unable to analyze the strategy. Please ensure all previous sections are completed."}
          </p>
        </div>
      </div>
    );
  }

  const radarData = {
    labels: ['Desirability', 'Effectiveness', 'Efficiency', 'Polish'],
    datasets: [
      {
        label: 'Your Score',
        data: [
          analysis.deepScore.desirability,
          analysis.deepScore.effectiveness,
          analysis.deepScore.efficiency,
          analysis.deepScore.polish
        ],
        backgroundColor: 'rgba(255, 210, 63, 0.2)',
        borderColor: '#FFD23F',
        borderWidth: 2,
      },
      {
        label: 'Industry Benchmark',
        data: [7.1, 6.9, 6.7, 6.3],
        backgroundColor: 'rgba(156, 163, 175, 0.2)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
      }
    ],
  };

  const componentScores = {
    labels: ['Product Description', 'User Endgame', 'Challenges', 'Solutions', 'Model Selection', 'Free Features'],
    datasets: [
      {
        label: 'Component Scores',
        data: [
          analysis.componentScores.productDescription,
          analysis.componentScores.userEndgame,
          analysis.componentScores.challenges,
          analysis.componentScores.solutions,
          analysis.componentScores.modelSelection,
          analysis.componentScores.freeFeatures
        ],
        backgroundColor: [
          'rgba(255, 210, 63, 0.9)',
          'rgba(255, 210, 63, 0.8)',
          'rgba(255, 210, 63, 0.7)',
          'rgba(255, 210, 63, 0.6)',
          'rgba(255, 210, 63, 0.5)',
          'rgba(255, 210, 63, 0.4)',
        ],
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        grid: {
          color: '#333333',
        },
        angleLines: {
          color: '#333333',
        },
        pointLabels: {
          color: '#FFFFFF',
        },
        ticks: {
          color: '#FFFFFF',
          backdropColor: '#1C1C1C',
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#333333',
        },
        ticks: {
          color: '#FFFFFF',
        },
      },
      x: {
        grid: {
          color: '#333333',
        },
        ticks: {
          color: '#FFFFFF',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF',
        },
      },
      tooltip: {
        backgroundColor: '#2A2A2A',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#333333',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Product-Led Model Analysis</h2>
            <p className="text-gray-400 mt-1">Overall DEEP Score: {Math.round((
              analysis.deepScore.desirability +
              analysis.deepScore.effectiveness +
              analysis.deepScore.efficiency +
              analysis.deepScore.polish
            ) * 2.5)}/100</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Model Selected:</p>
            <p className="text-lg font-medium text-white capitalize">{store.selectedModel?.replace('-', ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">DEEP Score Breakdown</h3>
            <div className="h-[300px] bg-[#1C1C1C] p-4 rounded-lg">
              <Radar data={radarData} options={chartOptions} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Key Strengths</h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#FFD23F]" />
                    <span className="text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Critical Weaknesses</h3>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-red-500" />
                    <span className="text-gray-300">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
        <button
          onClick={() => toggleSection('componentAnalysis')}
          className="w-full flex items-center justify-between text-lg font-semibold mb-4 text-white"
        >
          <span>Component-Specific Analysis</span>
          {expandedSections.componentAnalysis ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.componentAnalysis && (
          <div className="space-y-6">
            <div className="h-[300px] bg-[#1C1C1C] p-4 rounded-lg">
              <Bar data={componentScores} options={chartOptions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries({
                'Product Description': {
                  score: analysis.componentScores.productDescription,
                  strengths: 'Clear value proposition, well-defined market position',
                  recommendations: 'Emphasize unique collaboration features more prominently'
                },
                'User Endgame': {
                  score: analysis.componentScores.userEndgame,
                  strengths: 'Compelling, achievable, well-articulated',
                  recommendations: 'Break down into more granular progression steps'
                },
                'Challenges': {
                  score: analysis.componentScores.challenges,
                  strengths: 'Comprehensive coverage of beginner obstacles',
                  recommendations: 'Expand analysis of intermediate challenges to improve upgrade path'
                },
                'Solutions': {
                  score: analysis.componentScores.solutions,
                  strengths: 'Creative approaches to document creation and sharing',
                  recommendations: 'Develop additional solutions for document discovery and retrieval'
                },
                'Model Selection': {
                  score: analysis.componentScores.modelSelection,
                  strengths: 'Usage-based approach aligns well with product usage patterns',
                  recommendations: 'Consider hybrid approach with some time-limited premium features'
                },
                'Free Features': {
                  score: analysis.componentScores.freeFeatures,
                  strengths: 'Core functionality well-represented',
                  recommendations: 'Gradually increase limitations rather than hard cutoffs'
                }
              }).map(([component, data]) => (
                <div key={component} className="bg-[#1C1C1C] p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{component}</h4>
                    <span className="text-lg font-semibold text-[#FFD23F]">{data.score}/100</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-white">Strengths:</span> <span className="text-gray-400">{data.strengths}</span></p>
                    <p><span className="font-medium text-white">Recommendations:</span> <span className="text-gray-400">{data.recommendations}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
        <button
          onClick={() => toggleSection('actionPlan')}
          className="w-full flex items-center justify-between text-lg font-semibold mb-4 text-white"
        >
          <span>Action Plan</span>
          {expandedSections.actionPlan ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.actionPlan && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-white mb-3">Immediate Wins (1-30 days)</h4>
              <ul className="space-y-2">
                {analysis.actionPlan.immediate.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#FFD23F]" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">Medium-Term Improvements (30-90 days)</h4>
              <ul className="space-y-2">
                {analysis.actionPlan.medium.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#FFD23F]" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">Long-Term Strategy (90+ days)</h4>
              <ul className="space-y-2">
                {analysis.actionPlan.long.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#FFD23F]" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
        <button
          onClick={() => toggleSection('testing')}
          className="w-full flex items-center justify-between text-lg font-semibold mb-4 text-white"
        >
          <span>Testing Framework</span>
          {expandedSections.testing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.testing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">A/B Test Recommendations</h4>
              <ul className="space-y-2">
                {analysis.testing.abTests.map((test, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#FFD23F]" />
                    <span className="text-gray-300">{test}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">Key Metrics to Track</h4>
              <ul className="space-y-2">
                {analysis.testing.metrics.map((metric, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#FFD23F]" />
                    <span className="text-gray-300">{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Ask Follow-up Questions</h3>
        
        <div className="space-y-4">
          <div 
            ref={chatContainerRef}
            className="h-64 overflow-y-auto border border-[#333333] rounded-lg p-4 space-y-4"
          >
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-[#FFD23F] text-[#1C1C1C]'
                      : 'bg-[#333333] text-white'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#333333] text-white p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ask a question about the analysis..."
              className="flex-1 p-3 bg-[#1C1C1C] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !message.trim()}
              className={`px-4 py-2 rounded-lg flex items-center ${
                isTyping || !message.trim()
                  ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90'
              }`}
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Send
                </>
              )}
            </button>
            <button
              onClick={() => setShowVoiceChat(true)}
              className="flex items-center px-4 py-2 rounded-lg bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Chat
            </button>
          </div>
        </div>
      </div>

      {showVoiceChat && (
        <VoiceChat onClose={() => setShowVoiceChat(false)} />
      )}
    </div>
  );
}
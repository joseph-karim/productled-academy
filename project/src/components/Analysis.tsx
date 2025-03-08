import React from 'react';
import { useFormStore } from '../store/formStore';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { MessageSquare, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    componentAnalysis: false,
    actionPlan: false,
    testing: false
  });
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
  const analysisCache = React.useRef<string | null>(null);

  React.useEffect(() => {
    const analyzeData = async () => {
      if (!store.productDescription || !store.userEndgame || !store.selectedModel) {
        return;
      }

      // Create a cache key from the current state
      const cacheKey = JSON.stringify({
        productDescription: store.productDescription,
        userEndgame: store.userEndgame,
        challenges: store.challenges,
        solutions: store.solutions,
        selectedModel: store.selectedModel,
        freeFeatures: store.freeFeatures
      });

      // Check if we already have this analysis cached
      if (analysisCache.current === cacheKey && analysis) {
        setIsAnalyzing(false);
        return;
      }

      try {
        const result = await analyzeFormData(
          store.productDescription,
          store.userEndgame,
          store.challenges,
          store.solutions,
          store.selectedModel,
          store.freeFeatures
        );
        setAnalysis(result);
        analysisCache.current = cacheKey;
      } catch (error) {
        console.error('Error analyzing data:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeData();
  }, [store.productDescription, store.userEndgame, store.challenges, store.solutions, store.selectedModel, store.freeFeatures]);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || !analysis) return;

    const newHistory = [
      ...chatHistory,
      { role: 'user' as const, content: message },
    ];
    setChatHistory(newHistory);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await getAnalysisResponse(message, {
        productDescription: store.productDescription,
        userEndgame: store.userEndgame,
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Analyzing your product strategy...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
          <p className="text-gray-600">Unable to analyze the strategy. Please ensure all previous sections are completed.</p>
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
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
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
          'rgba(37, 99, 235, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(96, 165, 250, 0.7)',
          'rgba(147, 197, 253, 0.7)',
          'rgba(191, 219, 254, 0.7)',
          'rgba(219, 234, 254, 0.7)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product-Led Model Analysis</h2>
            <p className="text-gray-600 mt-1">Overall DEEP Score: {Math.round((
              analysis.deepScore.desirability +
              analysis.deepScore.effectiveness +
              analysis.deepScore.efficiency +
              analysis.deepScore.polish
            ) * 2.5)}/100</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Model Selected:</p>
            <p className="text-lg font-medium text-gray-900 capitalize">{store.selectedModel?.replace('-', ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">DEEP Score Breakdown</h3>
            <div className="h-[300px]">
              <Radar data={radarData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Strengths</h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Critical Weaknesses</h3>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-red-500" />
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <button
          onClick={() => toggleSection('componentAnalysis')}
          className="w-full flex items-center justify-between text-lg font-semibold mb-4"
        >
          <span>Component-Specific Analysis</span>
          {expandedSections.componentAnalysis ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.componentAnalysis && (
          <div className="space-y-6">
            <div className="h-[300px]">
              <Bar
                data={componentScores}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
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
                <div key={component} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{component}</h4>
                    <span className="text-lg font-semibold text-blue-600">{data.score}/100</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Strengths:</span> {data.strengths}</p>
                    <p><span className="font-medium">Recommendations:</span> {data.recommendations}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <button
          onClick={() => toggleSection('actionPlan')}
          className="w-full flex items-center justify-between text-lg font-semibold mb-4"
        >
          <span>Action Plan</span>
          {expandedSections.actionPlan ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.actionPlan && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Immediate Wins (1-30 days)</h4>
              <ul className="space-y-2">
                {analysis.actionPlan.immediate.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Medium-Term Improvements (30-90 days)</h4>
              <ul className="space-y-2">
                {analysis.actionPlan.medium.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Long-Term Strategy (90+ days)</h4>
              <ul className="space-y-2">
                {analysis.actionPlan.long.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-500" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <button
          onClick={() => toggleSection('testing')}
          className="w-full flex items-center justify-between text-lg font-semibold mb-4"
        >
          <span>Testing Framework</span>
          {expandedSections.testing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.testing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">A/B Test Recommendations</h4>
              <ul className="space-y-2">
                {analysis.testing.abTests.map((test, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <span className="text-gray-700">{test}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Metrics to Track</h4>
              <ul className="space-y-2">
                {analysis.testing.metrics.map((metric, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <span className="text-gray-700">{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Ask Follow-up Questions</h3>
        
        <div className="space-y-4">
          <div 
            ref={chatContainerRef}
            className="h-64 overflow-y-auto border rounded-lg p-4 space-y-4"
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
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
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !message.trim()}
              className={`px-4 py-2 rounded-lg flex items-center ${
                isTyping || !message.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
          </div>
        </div>
      </div>
    </div>
  );
}
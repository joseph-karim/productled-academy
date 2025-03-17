import React, { useState, useEffect, useRef } from 'react';
import { useFormStore } from '../store/formStore';
import { Mic, Loader2, X, Download, Lightbulb, AlertTriangle, CheckCircle, ArrowRight, Target, Users } from 'lucide-react';
import { VoiceChat } from './VoiceChat';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { analyzeFormData } from '../services/ai/analysis';
import { ComponentCard } from './analysis/ComponentCard';

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
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitiatedAnalysis, setHasInitiatedAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const analyzeData = async () => {
      if (isAnalyzing || store.analysis || hasInitiatedAnalysis) return;
      
      const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner');
      
      if (!store.productDescription || !beginnerOutcome?.text || !store.selectedModel || !store.idealUser) {
        setError("Please complete all previous sections before viewing the analysis.");
        return;
      }

      setIsAnalyzing(true);
      setHasInitiatedAnalysis(true);
      
      try {
        const result = await analyzeFormData({
          productDescription: store.productDescription,
          idealUser: store.idealUser,
          userEndgame: beginnerOutcome.text,
          challenges: store.challenges,
          solutions: store.solutions,
          selectedModel: store.selectedModel,
          freeFeatures: store.freeFeatures,
          userJourney: store.userJourney
        });
        
        store.setAnalysis(result);
        setError(null);
      } catch (error) {
        console.error('Error analyzing data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred during analysis');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeData();
  }, [store, isAnalyzing, hasInitiatedAnalysis]);

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD23F]" />
          <p className="text-gray-400">Analyzing your product strategy...</p>
          <p className="text-gray-500 text-sm max-w-md mx-auto">This may take a minute as we evaluate your entire strategy against industry benchmarks and best practices.</p>
        </div>
      </div>
    );
  }

  if (!store.analysis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <X className="w-8 h-8 mx-auto text-red-500" />
          <p className="text-gray-400">
            {error || "Unable to analyze the strategy. Please ensure all previous sections are completed."}
          </p>
          <ul className="text-left text-gray-500 text-sm space-y-1">
            <li>• Product Description must be completed</li>
            <li>• Ideal User must be defined</li>
            <li>• User Endgame for beginners must be specified</li>
            <li>• Model Selection must be made</li>
            <li>• At least one Free Feature should be defined</li>
          </ul>
        </div>
      </div>
    );
  }

  const { deepScore, componentScores, componentFeedback, actionPlan, testing, summary, strengths, weaknesses, journeyAnalysis } = store.analysis;

  // Ensure arrays exist with fallbacks
  const safeStrengths = strengths || [];
  const safeWeaknesses = weaknesses || [];
  const safeActionPlan = {
    immediate: actionPlan?.immediate || [],
    medium: actionPlan?.medium || [],
    long: actionPlan?.long || [],
    people: actionPlan?.people || [],
    process: actionPlan?.process || [],
    technology: actionPlan?.technology || []
  };
  const safeTesting = {
    abTests: testing?.abTests || [],
    metrics: testing?.metrics || []
  };

  const radarData = {
    labels: ['Desirability', 'Effectiveness', 'Efficiency', 'Polish'],
    datasets: [
      {
        label: 'Your Score',
        data: [
          deepScore.desirability,
          deepScore.effectiveness,
          deepScore.efficiency,
          deepScore.polish
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

  const componentScoreData = {
    labels: [
      'Product Description', 
      'Ideal User', 
      'User Endgame', 
      'Challenges', 
      'Solutions', 
      'Model Selection',
      'User Journey'
    ],
    datasets: [
      {
        label: 'Component Scores',
        data: [
          componentScores.productDescription,
          componentScores.idealUser,
          componentScores.userEndgame,
          componentScores.challenges,
          componentScores.solutions,
          componentScores.modelSelection,
          componentScores.userJourney
        ],
        backgroundColor: [
          'rgba(255, 210, 63, 0.8)',
          'rgba(255, 210, 63, 0.75)',
          'rgba(255, 210, 63, 0.7)',
          'rgba(255, 210, 63, 0.65)',
          'rgba(255, 210, 63, 0.6)',
          'rgba(255, 210, 63, 0.55)',
          'rgba(255, 210, 63, 0.45)'
        ],
        borderColor: 'rgba(50, 50, 50, 0.5)',
        borderWidth: 1,
      }
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
          font: {
            size: 11
          }
        },
        ticks: {
          color: '#FFFFFF',
          backdropColor: '#1C1C1C',
          maxTicksLimit: 5,
          display: false
        },
        min: 0,
        max: 10
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF',
          font: {
            size: 12
          }
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
    maintainAspectRatio: false
  };

  const barOptions = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#333333',
        },
        ticks: {
          color: '#FFFFFF',
        }
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#FFFFFF',
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#2A2A2A',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#333333',
        borderWidth: 1,
      },
    },
    maintainAspectRatio: false
  };

  const componentAnalysis = {
    productDescription: {
      title: "Product Description",
      score: componentScores.productDescription,
      strengths: componentFeedback.productDescription.strengths || [],
      recommendations: componentFeedback.productDescription.recommendations || []
    },
    idealUser: {
      title: "Ideal User",
      score: componentScores.idealUser,
      strengths: componentFeedback.idealUser.strengths || [],
      recommendations: componentFeedback.idealUser.recommendations || []
    },
    userEndgame: {
      title: "User Endgame",
      score: componentScores.userEndgame,
      strengths: componentFeedback.userEndgame.strengths || [],
      recommendations: componentFeedback.userEndgame.recommendations || []
    },
    challenges: {
      title: "Challenges",
      score: componentScores.challenges,
      strengths: componentFeedback.challenges.strengths || [],
      recommendations: componentFeedback.challenges.recommendations || []
    },
    solutions: {
      title: "Solutions",
      score: componentScores.solutions,
      strengths: componentFeedback.solutions.strengths || [],
      recommendations: componentFeedback.solutions.recommendations || []
    },
    modelSelection: {
      title: "Model Selection",
      score: componentScores.modelSelection,
      strengths: componentFeedback.modelSelection.strengths || [],
      recommendations: componentFeedback.modelSelection.recommendations || []
    },
    userJourney: {
      title: "User Journey",
      score: componentScores.userJourney,
      strengths: componentFeedback.userJourney.strengths || [],
      recommendations: componentFeedback.userJourney.recommendations || []
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-[#FFD23F]";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-8">
      <div className="flex space-x-1 bg-[#1C1C1C] p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md ${activeTab === 'overview' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Strategy Overview
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 rounded-md ${activeTab === 'components' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Component Analysis
        </button>
        <button
          onClick={() => setActiveTab('journey')}
          className={`px-4 py-2 rounded-md ${activeTab === 'journey' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Journey Analysis
        </button>
        <button
          onClick={() => setActiveTab('action')}
          className={`px-4 py-2 rounded-md ${activeTab === 'action' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Action Plan
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Strategy Analysis</h2>
                <div className="mt-2 flex items-center">
                  <span className="text-gray-400 mr-2">Overall Score:</span>
                  <span className={`text-2xl font-bold ${getScoreColorClass(Math.round((
                    deepScore.desirability +
                    deepScore.effectiveness +
                    deepScore.efficiency +
                    deepScore.polish
                  ) * 2.5))}`}>
                    {Math.round((
                      deepScore.desirability +
                      deepScore.effectiveness +
                      deepScore.efficiency +
                      deepScore.polish
                    ) * 2.5)}/100
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Model Selected:</p>
                <p className="text-lg font-medium text-white capitalize">
                  {store.selectedModel?.replace('-', ' ')}
                </p>
                <p className="text-xs text-gray-400 mt-1">Analysis Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">DEEP Score Breakdown</h3>
                <div className="h-[300px] bg-[#1C1C1C] p-4 rounded-lg">
                  <Radar data={radarData} options={chartOptions} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
                <div className="bg-[#1C1C1C] p-4 rounded-lg h-[300px] overflow-y-auto">
                  <p className="text-gray-300 whitespace-pre-line">{summary}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#2A2A2A] p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Key Strengths</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {safeStrengths.map((strength, index) => (
                  <div key={index} className="bg-[#1C1C1C] p-3 rounded-lg">
                    <p className="text-gray-300 text-sm">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#2A2A2A] p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#FFD23F]" />
                <h3 className="text-lg font-semibold text-white">Potential Weaknesses</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {safeWeaknesses.map((weakness, index) => (
                  <div key={index} className="bg-[#1C1C1C] p-3 rounded-lg">
                    <p className="text-gray-300 text-sm">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-[#2A2A2A] p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4 capitalize">
                {store.selectedModel?.replace('-', ' ')} Model Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1C1C1C] p-4 rounded-lg">
                  <h4 className="font-medium text-[#FFD23F] mb-3">Model Fit Assessment</h4>
                  <p className="text-gray-300 text-sm">
                    {componentFeedback.modelSelection.analysis || 
                     "No specific analysis available for this model. Please complete all previous sections for a detailed analysis."}
                  </p>
                </div>
                <div className="bg-[#1C1C1C] p-4 rounded-lg">
                  <h4 className="font-medium text-[#FFD23F] mb-3">Strategic Considerations</h4>
                  <ul className="space-y-2">
                    {componentFeedback.modelSelection.considerations?.map((consideration, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                        <span className="text-gray-300 text-sm">{consideration}</span>
                      </li>
                    )) || (
                      <li className="text-gray-500 text-sm">No strategic considerations available.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'components' && (
        <>
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Component Scores</h3>
            <div className="h-[400px]">
              <Bar data={componentScoreData} options={barOptions} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Detailed Component Analysis</h3>
            <div className="space-y-3">
              {Object.entries(componentAnalysis).map(([key, component]) => (
                <ComponentCard 
                  key={key}
                  title={component.title}
                  score={component.score}
                  strengths={component.strengths}
                  recommendations={component.recommendations}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'journey' && (
        <div className="space-y-6">
          {journeyAnalysis ? (
            <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Customer Journey Analysis</h3>
              <p className="text-gray-300 mb-6">{journeyAnalysis.overview}</p>
              
              <div className="space-y-6">
                {['discovery', 'signup', 'activation', 'engagement', 'conversion'].map((stage) => {
                  const stageData = journeyAnalysis[stage as keyof typeof journeyAnalysis];
                  if (!stageData || typeof stageData !== 'object') return null;

                  return (
                    <div key={stage} className="bg-[#1C1C1C] p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-[#FFD23F] capitalize">{stage}</span>
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                        <span className={`text-sm font-medium px-2 py-0.5 rounded ${getScoreColorClass(stageData.score)} bg-opacity-20`}>
                          {stageData.score}/100
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{stageData.analysis}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-gray-400 mb-2">Strengths</h5>
                          <ul className="space-y-1">
                            {stageData.strengths?.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-green-400" />
                                <span className="text-gray-300 text-xs">{item}</span>
                              </li>
                            )) || (
                              <li className="text-gray-500 text-xs">No strengths identified.</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-gray-400 mb-2">Suggestions</h5>
                          <ul className="space-y-1">
                            {stageData.suggestions?.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-[#FFD23F]" />
                                <span className="text-gray-300 text-xs">{item}</span>
                              </li>
                            )) || (
                              <li className="text-gray-500 text-xs">No suggestions available.</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <X className="w-8 h-8 mx-auto text-red-500" />
                <p className="text-gray-400">Journey analysis data is not available.</p>
                <p className="text-gray-500 text-sm">Please ensure all previous sections are completed and try again.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'action' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#2A2A2A] p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Action Plan</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Immediate (1-30 days)</h4>
                  <ul className="space-y-2">
                    {safeActionPlan.immediate.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                        <span className="text-gray-300 text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Medium-term (30-90 days)</h4>
                  <ul className="space-y-2">
                    {safeActionPlan.medium.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                        <span className="text-gray-300 text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Long-term (90+ days)</h4>
                  <ul className="space-y-2">
                    {safeActionPlan.long.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                        <span className="text-gray-300 text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Testing Framework</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-[#FFD23F] mb-2">A/B Tests</h4>
                  <ul className="space-y-2">
                    {safeTesting.abTests.map((test, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                        <span className="text-gray-300 text-sm">{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Key Metrics</h4>
                  <ul className="space-y-2">
                    {safeTesting.metrics.map((metric, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                        <span className="text-gray-300 text-sm">{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#2A2A2A] p-6 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[#FFD23F]" />
              <h3 className="text-lg font-semibold text-white">Implementation Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-sm font-medium text-[#FFD23F] mb-2">People</h4>
                <ul className="space-y-2">
                  {safeActionPlan.people.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Process</h4>
                <ul className="space-y-2">
                  {safeActionPlan.process.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Technology</h4>
                <ul className="space-y-2">
                  {safeActionPlan.technology.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#FFD23F]" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => window.print()}
          className="flex items-center px-4 py-2 rounded-lg bg-[#1C1C1C] text-white hover:bg-[#333333]"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Analysis
        </button>
        <button
          onClick={() => setShowVoiceChat(true)}
          className="flex items-center px-4 py-2 rounded-lg bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90"
        >
          <Mic className="w-4 h-4 mr-2" />
          Voice Chat
        </button>
      </div>

      {showVoiceChat && (
        <VoiceChat onClose={() => setShowVoiceChat(false)} />
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { Mic, Loader2, X } from 'lucide-react';
import { VoiceChat } from './VoiceChat';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { analyzeFormData } from '../services/ai/analysis';
import { ComponentCard } from './analysis/ComponentCard';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export function Analysis() {
  const store = useFormStore();
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitiatedAnalysis, setHasInitiatedAnalysis] = useState(false);

  // Run the analysis once when the component mounts
  useEffect(() => {
    const analyzeData = async () => {
      // Skip if we're already analyzing or if analysis exists
      if (isAnalyzing || store.analysis || hasInitiatedAnalysis) return;
      
      // Get the beginner outcome text
      const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';
      
      if (!store.productDescription || !beginnerOutcome || !store.selectedModel) {
        setError("Please complete all previous sections before viewing the analysis.");
        return;
      }

      setIsAnalyzing(true);
      setHasInitiatedAnalysis(true);
      
      try {
        // Safe data handling for arrays that might be undefined
        const safeIdealUser = store.idealUser || {
          title: '',
          description: '',
          motivation: 'Medium' as const,
          ability: 'Medium' as const,
          traits: [],
          impact: ''
        };
        
        // Safe challenges handling
        const safeChallengesToPass = Array.isArray(store.challenges) 
          ? store.challenges.map(c => ({
              title: c?.title || '',
              description: c?.description || '',
              magnitude: typeof c?.magnitude === 'number' ? c.magnitude : 1,
              level: c?.level || 'beginner'
            }))
          : [];
        
        // Safe solutions handling
        const safeSolutionsToPass = Array.isArray(store.solutions)
          ? store.solutions.map(s => ({
              text: s?.text || '',
              type: s?.type || '',
              cost: s?.cost || ''
            }))
          : [];
        
        // Safe features handling
        const safeFeaturesToPass = Array.isArray(store.freeFeatures)
          ? store.freeFeatures.map(f => ({
              name: f?.name || '',
              description: f?.description || ''
            }))
          : [];
        
        // Log analysis request with safe data
        console.log('Starting analysis with:', {
          productDescription: store.productDescription,
          idealUser: safeIdealUser,
          userEndgame: beginnerOutcome,
          challenges: safeChallengesToPass,
          solutions: safeSolutionsToPass,
          selectedModel: store.selectedModel,
          freeFeatures: safeFeaturesToPass
        });

        // Call the analysis function with safe data
        const result = await analyzeFormData({
          productDescription: store.productDescription,
          idealUser: safeIdealUser,
          userEndgame: beginnerOutcome,
          challenges: safeChallengesToPass,
          solutions: safeSolutionsToPass,
          selectedModel: store.selectedModel,
          freeFeatures: safeFeaturesToPass,
          userJourney: store.userJourney
        });
        
        console.log('Analysis completed:', result);
        
        store.setAnalysis(result);
        setError(null);
      } catch (error) {
        console.error('Error analyzing data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeData();
  }, [store.productDescription, store.idealUser, store.selectedModel, store.challenges, store.solutions, store.freeFeatures, isAnalyzing, store.analysis, hasInitiatedAnalysis, store]);

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

  if (!store.analysis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <X className="w-8 h-8 mx-auto text-red-500" />
          <p className="text-gray-400">
            {error || "Unable to analyze the strategy. Please ensure all previous sections are completed."}
          </p>
        </div>
      </div>
    );
  }

  const { deepScore, componentScores, componentFeedback, actionPlan, testing, summary } = store.analysis;

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

  // Generate component analysis data
  const componentAnalysis = {
    productDescription: {
      title: "Product Description",
      score: componentScores.productDescription,
      strengths: componentFeedback.productDescription.strengths,
      recommendations: componentFeedback.productDescription.recommendations
    },
    idealUser: {
      title: "Ideal User",
      score: componentScores.idealUser,
      strengths: componentFeedback.idealUser.strengths,
      recommendations: componentFeedback.idealUser.recommendations
    },
    userEndgame: {
      title: "User Endgame",
      score: componentScores.userEndgame,
      strengths: componentFeedback.userEndgame.strengths,
      recommendations: componentFeedback.userEndgame.recommendations
    },
    challenges: {
      title: "Challenges",
      score: componentScores.challenges,
      strengths: componentFeedback.challenges.strengths,
      recommendations: componentFeedback.challenges.recommendations
    },
    solutions: {
      title: "Solutions",
      score: componentScores.solutions,
      strengths: componentFeedback.solutions.strengths,
      recommendations: componentFeedback.solutions.recommendations
    },
    modelSelection: {
      title: "Model Selection",
      score: componentScores.modelSelection,
      strengths: componentFeedback.modelSelection.strengths,
      recommendations: componentFeedback.modelSelection.recommendations
    },
    freeFeatures: {
      title: "Free Features",
      score: componentScores.freeFeatures,
      strengths: componentFeedback.freeFeatures.strengths,
      recommendations: componentFeedback.freeFeatures.recommendations
    },
    userJourney: {
      title: "User Journey",
      score: componentScores.userJourney,
      strengths: componentFeedback.userJourney.strengths,
      recommendations: componentFeedback.userJourney.recommendations
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Product-Led Strategy Analysis</h2>
            <p className="text-gray-400 mt-1">
              Overall DEEP Score: {Math.round((
                deepScore.desirability +
                deepScore.effectiveness +
                deepScore.efficiency +
                deepScore.polish
              ) * 2.5)}/100
            </p>
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

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
            <p className="text-gray-300 whitespace-pre-line">{summary}</p>
          </div>
        </div>
      </div>

      {/* Component Analysis */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Component Analysis</h3>
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

      {/* Action Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2A2A2A] p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Action Plan</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Immediate (1-30 days)</h4>
              <ul className="space-y-2">
                {actionPlan.immediate.map((action, index) => (
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
                {actionPlan.medium.map((action, index) => (
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
                {actionPlan.long.map((action, index) => (
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
                {testing.abTests.map((test, index) => (
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
                {testing.metrics.map((metric, index) => (
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

      <div className="flex justify-end">
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
import React, { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { Mic, Loader2, X } from 'lucide-react';
import { VoiceChat } from './VoiceChat';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { ComponentCard } from './analysis/ComponentCard';
import { analyzeFormData } from '../services/ai';

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
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const analyzeData = async () => {
      // Get the beginner outcome text
      const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';
      
      if (!store.productDescription || !beginnerOutcome || !store.selectedModel) {
        setIsAnalyzing(false);
        setError("Please complete all previous sections before viewing the analysis.");
        return;
      }

      try {
        const result = await analyzeFormData(
          store.productDescription,
          store.idealUser!,
          beginnerOutcome,
          store.challenges,
          store.solutions,
          store.selectedModel,
          store.freeFeatures,
          store.userJourney
        );
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
  }, [store]);

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

  const { analysis } = store;

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
      }
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

  // Create component analysis objects with consistent structure
  const componentAnalysis = {
    productDescription: {
      title: "Product Description",
      analysis: {
        score: analysis.componentScores.productDescription,
        summary: "Product description analysis",
        strengths: analysis.componentFeedback.productDescription.strengths,
        recommendations: analysis.componentFeedback.productDescription.recommendations
      }
    },
    idealUser: {
      title: "Ideal User",
      analysis: {
        score: analysis.componentScores.idealUser,
        summary: "Ideal user profile analysis",
        strengths: analysis.componentFeedback.idealUser.strengths,
        recommendations: analysis.componentFeedback.idealUser.recommendations
      }
    },
    userEndgame: {
      title: "User Endgame",
      analysis: {
        score: analysis.componentScores.userEndgame,
        summary: "User endgame analysis",
        strengths: analysis.componentFeedback.userEndgame.strengths,
        recommendations: analysis.componentFeedback.userEndgame.recommendations
      }
    },
    challenges: {
      title: "Challenges",
      analysis: {
        score: analysis.componentScores.challenges,
        summary: "Challenge analysis",
        strengths: analysis.componentFeedback.challenges.strengths,
        recommendations: analysis.componentFeedback.challenges.recommendations
      }
    },
    solutions: {
      title: "Solutions",
      analysis: {
        score: analysis.componentScores.solutions,
        summary: "Solution analysis",
        strengths: analysis.componentFeedback.solutions.strengths,
        recommendations: analysis.componentFeedback.solutions.recommendations
      }
    },
    modelSelection: {
      title: "Model Selection",
      analysis: {
        score: analysis.componentScores.modelSelection,
        summary: "Model selection analysis",
        strengths: analysis.componentFeedback.modelSelection.strengths,
        recommendations: analysis.componentFeedback.modelSelection.recommendations
      }
    },
    userJourney: {
      title: "User Journey",
      analysis: {
        score: analysis.componentScores.userJourney,
        summary: "User journey analysis",
        strengths: analysis.componentFeedback.userJourney.strengths,
        recommendations: analysis.componentFeedback.userJourney.recommendations
      }
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
                analysis.deepScore.desirability +
                analysis.deepScore.effectiveness +
                analysis.deepScore.efficiency +
                analysis.deepScore.polish
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
            <p className="text-gray-300 whitespace-pre-line">{analysis.summary}</p>
          </div>
        </div>
      </div>

      {/* Component Analysis */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Component Analysis</h3>
        
        {Object.entries(componentAnalysis).map(([key, component]) => (
          <ComponentCard 
            key={key}
            title={component.title}
            analysis={component.analysis}
          />
        ))}
      </div>

      {/* Action Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2A2A2A] p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Action Plan</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-[#FFD23F] mb-2">Immediate (1-30 days)</h4>
              <ul className="space-y-2">
                {analysis.actionPlan.immediate.map((action, index) => (
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
                {analysis.actionPlan.medium.map((action, index) => (
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
                {analysis.actionPlan.long.map((action, index) => (
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
                {analysis.testing.abTests.map((test, index) => (
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
                {analysis.testing.metrics.map((metric, index) => (
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
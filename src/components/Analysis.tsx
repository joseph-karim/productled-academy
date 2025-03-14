import React, { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { Mic, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { VoiceChat } from './VoiceChat';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { analyzeFormData } from '../services/ai';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Improved ComponentCard with expandable interface
export function ComponentCard({ title, analysis }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-[#FFD23F]';
    return 'text-red-500';
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <h4 className="text-white font-medium">{title}</h4>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`font-semibold ${getScoreColor(analysis.score)}`}>
            {analysis.score}/100
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 bg-[#1C1C1C] border-t border-[#333333]">
          {/* Summary section */}
          {analysis.summary && (
            <div className="mb-4 pt-3">
              <p className="text-gray-300 text-sm">{analysis.summary}</p>
            </div>
          )}
          
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="mb-4">
              <h5 className="text-[#FFD23F] text-sm font-medium mb-2">Strengths</h5>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-green-500" />
                    <span className="text-gray-300 text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <h5 className="text-[#FFD23F] text-sm font-medium mb-2">Recommendations</h5>
              <ul className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-[#FFD23F]" />
                    <span className="text-gray-300 text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Analysis() {
  const store = useFormStore();
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasInitiatedAnalysis, setHasInitiatedAnalysis] = useState(false);
  const [error, setError] = useState(null);

  // Generate component summaries based on analysis data
  // This function ensures we have consistent, pre-processed summaries
  const generateComponentSummaries = (analysis) => {
    if (!analysis) return null;
    
    // Create standard component summaries with coherent descriptions
    return {
      productDescription: {
        title: "Product Description",
        analysis: {
          score: analysis.componentScores.productDescription,
          summary: `Your product description scores ${analysis.componentScores.productDescription}/100, indicating ${analysis.componentScores.productDescription >= 85 ? 'exceptional clarity' : analysis.componentScores.productDescription >= 70 ? 'good positioning' : 'some improvement opportunities'} in how you articulate your value proposition.`,
          strengths: analysis.componentFeedback.productDescription.strengths,
          recommendations: analysis.componentFeedback.productDescription.recommendations
        }
      },
      idealUser: {
        title: "Ideal User",
        analysis: {
          score: analysis.componentScores.idealUser,
          summary: `Your ideal user definition scores ${analysis.componentScores.idealUser}/100, showing ${analysis.componentScores.idealUser >= 85 ? 'precise targeting' : analysis.componentScores.idealUser >= 70 ? 'solid understanding' : 'opportunities to refine'} your target audience characteristics.`,
          strengths: analysis.componentFeedback.idealUser.strengths,
          recommendations: analysis.componentFeedback.idealUser.recommendations
        }
      },
      userEndgame: {
        title: "User Endgame",
        analysis: {
          score: analysis.componentScores.userEndgame,
          summary: `Your user endgame scores ${analysis.componentScores.userEndgame}/100, ${analysis.componentScores.userEndgame >= 85 ? 'clearly demonstrating' : analysis.componentScores.userEndgame >= 70 ? 'effectively showing' : 'somewhat illustrating'} the transformation users experience with your product.`,
          strengths: analysis.componentFeedback.userEndgame.strengths,
          recommendations: analysis.componentFeedback.userEndgame.recommendations
        }
      },
      challenges: {
        title: "Challenges",
        analysis: {
          score: analysis.componentScores.challenges,
          summary: `Your challenge analysis scores ${analysis.componentScores.challenges}/100, ${analysis.componentScores.challenges >= 85 ? 'thoroughly addressing' : analysis.componentScores.challenges >= 70 ? 'adequately covering' : 'partially identifying'} obstacles your users face.`,
          strengths: analysis.componentFeedback.challenges.strengths,
          recommendations: analysis.componentFeedback.challenges.recommendations
        }
      },
      solutions: {
        title: "Solutions",
        analysis: {
          score: analysis.componentScores.solutions,
          summary: `Your solutions score ${analysis.componentScores.solutions}/100, ${analysis.componentScores.solutions >= 85 ? 'excellently resolving' : analysis.componentScores.solutions >= 70 ? 'effectively addressing' : 'partially solving'} the challenges identified in your strategy.`,
          strengths: analysis.componentFeedback.solutions.strengths,
          recommendations: analysis.componentFeedback.solutions.recommendations
        }
      },
      modelSelection: {
        title: "Model Selection",
        analysis: {
          score: analysis.componentScores.modelSelection,
          summary: `Your model selection scores ${analysis.componentScores.modelSelection}/100, indicating ${analysis.componentScores.modelSelection >= 85 ? 'ideal alignment' : analysis.componentScores.modelSelection >= 70 ? 'good fit' : 'potential misalignment'} with your product and user journey.`,
          strengths: analysis.componentFeedback.modelSelection.strengths,
          recommendations: analysis.componentFeedback.modelSelection.recommendations
        }
      },
      freeFeatures: {
        title: "Free Features",
        analysis: {
          score: analysis.componentScores.freeFeatures || 0,
          summary: `Your free features selection scores ${analysis.componentScores.freeFeatures || 0}/100, ${analysis.componentScores.freeFeatures >= 85 ? 'expertly balancing' : analysis.componentScores.freeFeatures >= 70 ? 'effectively balancing' : 'somewhat balancing'} value delivery and conversion potential.`,
          strengths: analysis.componentFeedback.freeFeatures?.strengths || [],
          recommendations: analysis.componentFeedback.freeFeatures?.recommendations || []
        }
      },
      userJourney: {
        title: "User Journey",
        analysis: {
          score: analysis.componentScores.userJourney,
          summary: `Your user journey mapping scores ${analysis.componentScores.userJourney}/100, ${analysis.componentScores.userJourney >= 85 ? 'comprehensively plotting' : analysis.componentScores.userJourney >= 70 ? 'clearly outlining' : 'partially defining'} the path from awareness to conversion.`,
          strengths: analysis.componentFeedback.userJourney.strengths,
          recommendations: analysis.componentFeedback.userJourney.recommendations
        }
      }
    };
  };

  // Run the analysis once when the component mounts or when required data changes
  useEffect(() => {
    const analyzeData = async () => {
      // Skip if we're already analyzing or if analysis is complete
      if (isAnalyzing || store.analysis || hasInitiatedAnalysis) return;
      
      // Get the beginner outcome text
      const beginnerOutcome = store.outcomes?.find(o => o.level === 'beginner')?.text || '';
      
      if (!store.productDescription || !beginnerOutcome || !store.selectedModel) {
        setError("Please complete all previous sections before viewing the analysis.");
        return;
      }

      setIsAnalyzing(true);
      setHasInitiatedAnalysis(true);
      
      try {
        // Only run the analysis if it hasn't been done before
        const result = await analyzeFormData(
          store.productDescription,
          store.idealUser || {},
          beginnerOutcome,
          store.challenges || [],
          store.solutions || [],
          store.selectedModel,
          store.freeFeatures || [],
          store.userJourney
        );
        
        // Store the analysis result
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

  // Create pre-processed component analysis with coherent summaries
  const componentAnalysis = generateComponentSummaries(store.analysis);
  
  // Only proceed if we have valid component analysis
  if (!componentAnalysis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <X className="w-8 h-8 mx-auto text-red-500" />
          <p className="text-gray-400">
            Unable to process analysis results. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const { deepScore, actionPlan, testing, summary } = store.analysis;

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
              analysis={component.analysis}
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
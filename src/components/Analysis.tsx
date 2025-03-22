import React, { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { usePackageStore } from '../store/packageStore';
import { useAuthStore } from '../store/authStore';
import { 
  Mic, 
  Loader2, 
  X, 
  Download, 
  Share2,
  Link,
  LogIn,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { VoiceChat } from './VoiceChat';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { analyzeFormData } from '../services/ai/analysis';
import { ComponentCard } from './analysis/ComponentCard';
import { shareAnalysis, saveAnalysis, updateAnalysis } from '../services/supabase';
import { AuthModal } from './auth/AuthModal';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AnalysisProps {
  isShared?: boolean;
}

export function Analysis({ isShared = false }: AnalysisProps) {
  const store = useFormStore();
  const packageStore = usePackageStore();
  const { user } = useAuthStore();
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'share' | 'export' | null>(null);

  useEffect(() => {
    const analyzeData = async () => {
      if (isAnalyzing || store.analysis) return;
      
      const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner');
      
      if (!store.productDescription || !beginnerOutcome?.text || !store.selectedModel || !store.idealUser) {
        setError("Please complete all previous sections before viewing the analysis.");
        return;
      }

      setIsAnalyzing(true);
      
      try {
        const savedAnalysis = await saveAnalysis({
          productDescription: store.productDescription,
          idealUser: store.idealUser,
          outcomes: store.outcomes,
          challenges: store.challenges,
          solutions: store.solutions,
          selectedModel: store.selectedModel,
          features: packageStore.features,
          userJourney: store.userJourney
        });

        const result = await analyzeFormData({
          productDescription: store.productDescription,
          idealUser: store.idealUser,
          userEndgame: beginnerOutcome.text,
          challenges: store.challenges,
          solutions: store.solutions,
          selectedModel: store.selectedModel,
          packages: {
            features: packageStore.features,
            pricingStrategy: packageStore.pricingStrategy!
          }
        });
        
        await updateAnalysis(savedAnalysis.id, {
          analysisResults: result
        });

        store.setAnalysis({
          ...result,
          id: savedAnalysis.id
        });
        
        setError(null);
      } catch (error) {
        console.error('Error analyzing data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred during analysis');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeData();
  }, [store, packageStore, isAnalyzing]);

  const handleAuthRequired = (action: 'share' | 'export') => {
    if (!user) {
      setPendingAction(action);
      setShowAuthModal(true);
      return true;
    }
    return false;
  };

  const handleShare = async () => {
    if (handleAuthRequired('share')) return;

    if (!store.analysis?.id) {
      setError("Analysis must be saved before sharing");
      return;
    }
    
    try {
      setIsSharing(true);
      const shareId = await shareAnalysis(store.analysis.id);
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      setShareUrl(shareUrl);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Show success message
      setError("Share link copied to clipboard!");
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error sharing analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to share analysis');
    } finally {
      setIsSharing(false);
    }
  };

  const handleExport = () => {
    if (handleAuthRequired('export')) return;
    window.print();
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingAction === 'share') {
      handleShare();
    } else if (pendingAction === 'export') {
      handleExport();
    }
    setPendingAction(null);
  };

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
          <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
          <p className="text-gray-400">
            {error || "Unable to analyze the strategy. Please ensure all previous sections are completed."}
          </p>
          <ul className="text-left text-gray-500 text-sm space-y-1">
            <li>• Product Description must be completed</li>
            <li>• Ideal User must be defined</li>
            <li>• User Endgame for beginners must be specified</li>
            <li>• Model Selection must be made</li>
            <li>• Package features must be defined</li>
            <li>• Pricing strategy must be set</li>
          </ul>
        </div>
      </div>
    );
  }

  const { 
    deepScore, 
    componentScores, 
    componentFeedback, 
    actionPlan, 
    testing, 
    summary, 
    strengths, 
    weaknesses 
  } = store.analysis;

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
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 rounded-md ${activeTab === 'packages' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Package Analysis
        </button>
        <button
          onClick={() => setActiveTab('action')}
          className={`px-4 py-2 rounded-md ${activeTab === 'action' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Action Plan
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg space-y-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Strategy Analysis</h2>
              <div className="mt-2 flex items-center">
                <span className="text-gray-400 mr-2">Overall Score:</span>
                <span className={`text-2xl font-bold ${
                  deepScore.desirability >= 8 ? 'text-green-400' :
                  deepScore.desirability >= 6 ? 'text-[#FFD23F]' :
                  'text-red-400'
                }`}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1C1C1C] p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Key Strengths</h4>
              <div className="space-y-2">
                {strengths.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-gray-300">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1C1C1C] p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Areas for Improvement</h4>
              <div className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-[#FFD23F] flex-shrink-0 mt-1" />
                    <p className="text-gray-300">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Component Analysis Tab */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          <ComponentCard
            title="Product Description"
            score={componentScores.productDescription}
            strengths={componentFeedback.productDescription.strengths}
            recommendations={componentFeedback.productDescription.recommendations}
          />
          <ComponentCard
            title="Ideal User"
            score={componentScores.idealUser}
            strengths={componentFeedback.idealUser.strengths}
            recommendations={componentFeedback.idealUser.recommendations}
          />
          <ComponentCard
            title="User Endgame"
            score={componentScores.userEndgame}
            strengths={componentFeedback.userEndgame.strengths}
            recommendations={componentFeedback.userEndgame.recommendations}
          />
          <ComponentCard
            title="Challenges"
            score={componentScores.challenges}
            strengths={componentFeedback.challenges.strengths}
            recommendations={componentFeedback.challenges.recommendations}
          />
          <ComponentCard
            title="Solutions"
            score={componentScores.solutions}
            strengths={componentFeedback.solutions.strengths}
            recommendations={componentFeedback.solutions.recommendations}
          />
          <ComponentCard
            title="Model Selection"
            score={componentScores.modelSelection}
            strengths={componentFeedback.modelSelection.strengths}
            recommendations={componentFeedback.modelSelection.recommendations}
            analysis={componentFeedback.modelSelection.analysis}
            considerations={componentFeedback.modelSelection.considerations}
          />
        </div>
      )}

      {/* Package Analysis Tab */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <ComponentCard
            title="Package Design"
            score={componentScores.packageDesign}
            strengths={componentFeedback.packageDesign.strengths}
            recommendations={componentFeedback.packageDesign.recommendations}
            analysis={componentFeedback.packageDesign.analysis}
            metrics={{
              'Balance Score': componentFeedback.packageDesign.balanceScore
            }}
          />
          <ComponentCard
            title="Pricing Strategy"
            score={componentScores.pricingStrategy}
            strengths={componentFeedback.pricingStrategy.strengths}
            recommendations={componentFeedback.pricingStrategy.recommendations}
            analysis={componentFeedback.pricingStrategy.analysis}
            metrics={{
              'Conversion Potential': componentFeedback.pricingStrategy.conversionPotential
            }}
          />
        </div>
      )}

      {/* Action Plan Tab */}
      {activeTab === 'action' && (
        <div className="space-y-6">
          <ComponentCard
            title="Implementation Timeline"
            score={100}
            strengths={[]}
            recommendations={[
              ...actionPlan.immediate.map(a => `Immediate (1-30 days): ${a}`),
              ...actionPlan.medium.map(a => `Medium-term (30-90 days): ${a}`),
              ...actionPlan.long.map(a => `Long-term (90+ days): ${a}`)
            ]}
          />
          <ComponentCard
            title="Testing Framework"
            score={100}
            strengths={testing.metrics.map(m => `Metric: ${m}`)}
            recommendations={testing.abTests.map(t => `A/B Test: ${t}`)}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 rounded-lg bg-[#1C1C1C] text-white hover:bg-[#333333]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Analysis
          </button>
          {!isShared && (
            shareUrl ? (
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="flex items-center px-4 py-2 rounded-lg bg-[#1C1C1C] text-[#FFD23F] hover:bg-[#333333]"
              >
                <Link className="w-4 h-4 mr-2" />
                Copy Share Link
              </button>
            ) : (
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center px-4 py-2 rounded-lg bg-[#1C1C1C] text-white hover:bg-[#333333]"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isSharing ? 'Sharing...' : 'Share Analysis'}
              </button>
            )
          )}
        </div>
        {!isShared && (
          <button
            onClick={() => setShowVoiceChat(true)}
            className="flex items-center px-4 py-2 rounded-lg bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90"
          >
            <Mic className="w-4 h-4 mr-2" />
            Voice Chat
          </button>
        )}
      </div>

      {showVoiceChat && (
        <VoiceChat onClose={() => setShowVoiceChat(false)} />
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => {
            setShowAuthModal(false);
            setPendingAction(null);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
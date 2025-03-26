import React, { useState, useEffect, useRef } from 'react';
import { useFormStore } from '../store/formStore';
import { usePackageStore } from '../store/packageStore';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  X, 
  Download, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Target, 
  Users,
  Package,
  DollarSign,
  Share2,
  Link as LinkIcon,
  Save,
  Home,
  Edit
} from 'lucide-react';
import { VoiceChat } from './VoiceChat';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { analyzeFormData } from '../services/ai/analysis';
import { ComponentCard } from './analysis/ComponentCard';
import { shareAnalysis, saveAnalysis, updateAnalysis } from '../services/supabase';
import { AuthModal } from './auth/AuthModal';
import { supabase } from '../services/supabase';

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

interface AnalysisProps {
  isShared?: boolean;
}

export function Analysis({ isShared = false }: AnalysisProps) {
  const store = useFormStore();
  const packageStore = usePackageStore();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'share' | 'export' | 'save' | null>(null);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  useEffect(() => {
    // Debug the current store state
    console.log("Analysis component - isShared:", isShared);
    console.log("Analysis component - store.analysis:", store.analysis);
    console.log("Analysis component - packageStore state:", packageStore);
    
    const analyzeData = async () => {
      // If already analyzing or we already have analysis data, don't do anything
      if (isAnalyzing || store.analysis) return;
      
      // For shared analyses, we expect the data to already be in the store
      // If it's not there, show an error
      if (isShared) {
        if (!store.analysis) {
          console.error("Analysis data missing in shared view");
          setError("Analysis data not available");
        }
        return;
      }
      
      // For regular (non-shared) analyses, validate required data
      const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner');
      
      if (!store.productDescription || !beginnerOutcome?.text || !store.selectedModel || !store.idealUser) {
        setError("Please complete all previous sections before viewing the analysis.");
        return;
      }

      setIsAnalyzing(true);
      
      try {
        const analysisData = {
          title: store.title || 'Untitled Analysis',
          productDescription: store.productDescription,
          idealUser: store.idealUser,
          outcomes: store.outcomes,
          challenges: store.challenges,
          solutions: store.solutions,
          selectedModel: store.selectedModel,
          features: packageStore.features,
            pricingStrategy: packageStore.pricingStrategy,
            userJourney: store.userJourney,
            analysisResults: null // Initialize as null
        };

        const savedAnalysis = await saveAnalysis(analysisData);

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
          analysisResults: result,
          pricingStrategy: packageStore.pricingStrategy // Keep pricing strategy during update
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
  }, [store, packageStore, isAnalyzing, isShared]);

  const handleSave = async () => {
    if (!store.title) {
      setShowTitlePrompt(true);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const analysisData = {
        title: store.title,
        productDescription: store.productDescription,
        idealUser: store.idealUser,
        outcomes: store.outcomes,
        challenges: store.challenges,
        solutions: store.solutions,
        selectedModel: store.selectedModel,
        features: packageStore.features,
        pricingStrategy: packageStore.pricingStrategy,
        userJourney: store.userJourney,
        analysisResults: store.analysis
      };

      if (store.analysis?.id) {
        await updateAnalysis(store.analysis.id, {
          ...analysisData,
          pricingStrategy: packageStore.pricingStrategy
        });
      } else {
        const savedAnalysis = await saveAnalysis({
          ...analysisData,
          pricingStrategy: packageStore.pricingStrategy
        });
        store.setAnalysis({ ...store.analysis!, id: savedAnalysis.id });
      }

      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
      successMessage.textContent = 'Analysis saved successfully';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
      console.error('Error saving analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // If not authenticated, show auth modal
    if (!user) {
      setShowAuthModal(true);
      setPendingAction('share');
      return;
    }
    
    // Check if analysis has a title
    if (!store.title || store.title.trim() === '' || store.title === 'Untitled Analysis') {
      setShowTitlePrompt(true);
      setPendingAction('share');
      return;
    }
    
    if (!store.analysis?.id) {
      try {
        const analysisData = {
          title: store.title,
          productDescription: store.productDescription,
          idealUser: store.idealUser,
          outcomes: store.outcomes,
          challenges: store.challenges,
          solutions: store.solutions,
          selectedModel: store.selectedModel,
          features: packageStore.features,
          userJourney: store.userJourney,
          analysisResults: store.analysis,
          pricingStrategy: packageStore.pricingStrategy
        };
        
        const savedAnalysis = await saveAnalysis(analysisData);
        store.setAnalysis({ ...store.analysis!, id: savedAnalysis.id });
        
        await handleShareWithId(savedAnalysis.id);
      } catch (error) {
        console.error('Error saving analysis for sharing:', error);
        setError(error instanceof Error ? error.message : 'Failed to save analysis for sharing');
      }
    } else {
      await handleShareWithId(store.analysis.id);
    }
  };

  const handleShareWithId = async (analysisId: string) => {
    try {
      setIsSharing(true);
      setError(null);
      
      const { id: shareId } = await shareAnalysis(analysisId);
      const url = `${window.location.origin}/shared/${shareId}`;
      setShareUrl(url);
      
      await navigator.clipboard.writeText(url);
      setShowCopiedMessage(true);
      
      setTimeout(() => {
        setShowCopiedMessage(false);
      }, 3000);
      
      setError('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to share analysis');
    } finally {
      setIsSharing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-[#FFD23F] animate-spin" />
        <p className="text-gray-300">Analyzing your product and pricing strategy...</p>
        <p className="text-gray-500 text-sm">This may take up to 30 seconds</p>
      </div>
    );
  }

  if (!store.analysis && !isShared) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="bg-[#1C1C1C] p-6 rounded-lg max-w-lg">
          <h3 className="text-lg font-medium text-white mb-4">Analysis Unavailable</h3>
          <p className="text-gray-300 mb-4">
            We couldn't generate an analysis for your product. Please make sure you've completed all the previous steps.
          </p>
          <div className="flex justify-end">
            <Link 
              to="/"
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90 flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </div>
        </div>
        {error && (
          <div className="text-red-500">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (!store.analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-[#FFD23F] animate-spin" />
        <p className="text-gray-300">Loading shared analysis...</p>
      </div>
    );
  }
  
  // Extract analysis data
  const { 
    overallScore,
    strengths,
    weaknesses,
    componentScores,
    componentFeedback,
    pricing: {
      revenueProjection,
      keyMetrics,
      benchmarks
    },
    actionPlan,
    testing
  } = store.analysis;

  // Prepare data for radar chart
  const radarData = {
    labels: Object.keys(componentScores).map(key => {
      // Convert camelCase to regular text with spaces
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }),
    datasets: [
      {
        label: 'Component Scores',
        data: Object.values(componentScores),
        backgroundColor: 'rgba(255, 210, 63, 0.2)',
        borderColor: '#FFD23F',
        borderWidth: 2,
        pointBackgroundColor: '#FFD23F',
        pointBorderColor: '#FFD23F',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#FFD23F'
      }
    ]
  };

  // Prepare data for revenue projection bar chart
  const revenueData = {
    labels: revenueProjection.months.map(m => m.month),
    datasets: [
      {
        label: 'Revenue',
        data: revenueProjection.months.map(m => m.revenue),
        backgroundColor: '#FFD23F',
        borderColor: '#FFD23F',
        borderWidth: 1
      },
      {
        label: 'Users',
        data: revenueProjection.months.map(m => m.users * 10), // Scale up users for visibility
        backgroundColor: '#4C6EF5',
        borderColor: '#4C6EF5',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1C1C1C] rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            {isShared ? (
              <h2 className="text-2xl font-bold text-white">{store.title || 'Shared Analysis'}</h2>
            ) : (
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-white">{store.title || 'Untitled Analysis'}</h2>
                <button 
                  onClick={() => setShowTitlePrompt(true)}
                  className="p-1 hover:bg-[#333333] rounded"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
            <p className="text-gray-400 text-sm mt-1">Free Model Analyzer Report</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Overall Score</span>
            <div className="flex items-center bg-[#333333] rounded-full px-3 py-1">
              <span className="text-[#FFD23F] font-bold">{overallScore}%</span>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#FFD23F] text-[#1C1C1C] font-medium'
                : 'bg-[#333333] text-gray-300 hover:bg-[#444444]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'components'
                ? 'bg-[#FFD23F] text-[#1C1C1C] font-medium'
                : 'bg-[#333333] text-gray-300 hover:bg-[#444444]'
            }`}
          >
            Components
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'packages'
                ? 'bg-[#FFD23F] text-[#1C1C1C] font-medium'
                : 'bg-[#333333] text-gray-300 hover:bg-[#444444]'
            }`}
          >
            <Package className="w-4 h-4 inline-block mr-1" />
            Package Analysis
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'revenue'
                ? 'bg-[#FFD23F] text-[#1C1C1C] font-medium'
                : 'bg-[#333333] text-gray-300 hover:bg-[#444444]'
            }`}
          >
            <DollarSign className="w-4 h-4 inline-block mr-1" />
            Revenue Projection
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'action'
                ? 'bg-[#FFD23F] text-[#1C1C1C] font-medium'
                : 'bg-[#333333] text-gray-300 hover:bg-[#444444]'
            }`}
          >
            <Target className="w-4 h-4 inline-block mr-1" />
            Action Plan
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-[#1C1C1C] p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Product & Model Overview</h3>
            <div className="mb-6">
              <div className="mx-auto" style={{ width: '100%', maxWidth: '600px', height: '400px' }}>
                <Radar 
                  data={radarData} 
                  options={{
                    plugins: {
                      legend: {
                        labels: {
                          color: '#FFFFFF'
                        }
                      }
                    },
                    scales: {
                      r: {
                        angleLines: {
                          color: '#333333'
                        },
                        grid: {
                          color: '#333333'
                        },
                        pointLabels: {
                          color: '#FFFFFF'
                        },
                        ticks: {
                          color: '#CCCCCC',
                          backdropColor: 'transparent'
                        }
                      }
                    },
                    elements: {
                      line: {
                        tension: 0.2
                      }
                    }
                  }}
                />
              </div>
            </div>

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

      {!isShared && (
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 rounded-lg bg-[#1C1C1C] text-white hover:bg-[#333333]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </button>
            {shareUrl ? (
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="flex items-center px-4 py-2 rounded-lg bg-[#1C1C1C] text-[#FFD23F] hover:bg-[#333333]"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
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
            )}
          </div>
        </div>
      )}

      {showCopiedMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Copied to clipboard!
        </div>
      )}

      {error && !showCopiedMessage && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
          error.toLowerCase().includes('copied') || error.toLowerCase().includes('success')
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {error}
        </div>
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => {
            setShowAuthModal(false);
            setPendingAction(null);
          }}
          onSuccess={() => {
            setShowAuthModal(false);
            if (pendingAction === 'share') handleShare();
            else if (pendingAction === 'save') handleSave();
            setPendingAction(null);
          }}
        />
      )}

      {showVoiceChat && (
        <VoiceChat
          onClose={() => setShowVoiceChat(false)}
          context={{
            productDescription: store.productDescription,
            idealUser: store.idealUser,
            outcomes: store.outcomes,
            challenges: store.challenges,
            solutions: store.solutions,
            selectedModel: store.selectedModel,
            features: packageStore.features,
            pricingStrategy: packageStore.pricingStrategy,
            analysis: store.analysis
          }}
        />
      )}
    </div>
  );
}
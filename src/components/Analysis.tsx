import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useFormStore } from '../store/formStore';
import { usePackageStore } from '../store/packageStore';
import { analyzeStrategy } from '../services/ai';
import { saveAnalysis, shareAnalysis } from '../services/supabase';
import { AuthModal } from './auth/AuthModal';
import {
  AlertTriangle,
  Download,
  CheckCircle,
  Save,
  Share2,
  Edit,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Home,
  Bot,
  Copy,
  Link as LinkIcon,
  Loader2,
  Mic
} from 'lucide-react';
import { Chart, CategoryScale, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { AnalysisScoreBox } from './ui/AnalysisScoreBox';
import { ComponentCard } from './ui/ComponentCard';
import { ActionTask } from './ui/ActionTask';
import { UserJourneyStage } from './ui/UserJourneyStage';
import { VoiceChat } from './VoiceChat';

Chart.register(CategoryScale, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface AnalysisProps {
  isShared?: boolean;
}

interface ComponentScore {
  productDescription: number;
  idealUser: number;
  userEndgame: number;
  challenges: number;
  solutions: number;
  modelSelection: number;
  freeModelCanvas: number;
}

interface ComponentFeedback {
  productDescription: { strengths: string[]; recommendations: string[] };
  idealUser: { strengths: string[]; recommendations: string[] };
  userEndgame: { strengths: string[]; recommendations: string[] };
  challenges: { strengths: string[]; recommendations: string[] };
  solutions: { strengths: string[]; recommendations: string[] };
  modelSelection: { strengths: string[]; recommendations: string[] };
  freeModelCanvas: { strengths: string[]; recommendations: string[] };
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
    if (!store.analysis && !isShared) {
      analyzeProductStrategy();
    }
  }, []);

  const analyzeProductStrategy = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await analyzeStrategy({
        productDescription: store.productDescription,
        idealUser: store.idealUser,
        outcomes: store.outcomes,
        challenges: store.challenges,
        solutions: store.solutions,
        selectedModel: store.selectedModel,
        features: packageStore.features,
        pricingStrategy: packageStore.pricingStrategy
      });
      
      store.setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze strategy');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (isShared) return;

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // If not authenticated, show auth modal
    if (!user) {
      setShowAuthModal(true);
      setPendingAction('save');
      return;
    }

    // If no title, prompt for one
    if (!store.title) {
      setShowTitlePrompt(true);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Prepare analysis data
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

      // Update or create the analysis
      if (store.analysis?.id) {
        await saveAnalysis({
          ...analysisData,
          id: store.analysis.id
        });
        setError('Analysis saved successfully');
        setTimeout(() => setError(null), 3000);
      } else {
        const savedAnalysis = await saveAnalysis(analysisData);
        store.setAnalysis({ ...store.analysis!, id: savedAnalysis.id });
        // Navigate to the permalink
        navigate(`/analysis/${savedAnalysis.id}`, { replace: true });
        setError('Analysis saved successfully');
        setTimeout(() => setError(null), 3000);
      }
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
        const savedAnalysis = await saveAnalysis({
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
        });
        store.setAnalysis({ ...store.analysis!, id: savedAnalysis.id });
      } catch (error) {
        console.error('Error saving analysis:', error);
        setError('Failed to save analysis before sharing');
        return;
      }
    }

    try {
      setIsSharing(true);
      setError(null);
      const shareId = await shareAnalysis(store.analysis!.id);
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      setShareUrl(shareUrl);
      
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 3000);
      } catch (clipboardError) {
        console.warn('Could not copy to clipboard:', clipboardError);
      }
    } catch (error) {
      console.error('Share analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to share analysis');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 3000);
    } catch (error) {
      setError('Failed to copy to clipboard');
      setTimeout(() => setError(null), 3000);
    }
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
    weaknesses, 
    journeyAnalysis 
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
      {/* Title prompt modal */}
      {showTitlePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Name your analysis</h3>
            <input
              type="text"
              value={store.title}
              onChange={(e) => store.setTitle(e.target.value)}
              placeholder="Enter a title..."
              className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowTitlePrompt(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!store.title || store.title.trim() === '') {
                    store.setTitle('My Analysis');
                  }
                  setShowTitlePrompt(false);
                  
                  if (pendingAction === 'share') {
                    handleShare();
                  } else {
                    handleSave();
                  }
                  
                  setPendingAction(null);
                }}
                className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/my-analyses"
            className="flex items-center px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#333333]"
          >
            <Home className="w-4 h-4 mr-2" />
            My Analyses
          </Link>
          {!isShared && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Analysis
                </>
              )}
            </button>
          )}
        </div>
        {store.title && (
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-white">{store.title}</h1>
            {!isShared && (
              <button
                onClick={() => setShowTitlePrompt(true)}
                className="text-gray-400 hover:text-white"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

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
          />
          <ComponentCard
            title="Free Model Canvas"
            score={componentScores.freeModelCanvas}
            strengths={componentFeedback.freeModelCanvas.strengths}
            recommendations={componentFeedback.freeModelCanvas.recommendations}
          />
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Free Package Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-3">Limitations Assessment</h4>
                <ul className="space-y-2">
                  {packageStore.pricingStrategy?.freePackage.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-[#FFD23F] text-[#1C1C1C] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-300">{limitation.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{limitation.reasoning}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-3">Conversion Goals</h4>
                <ul className="space-y-2">
                  {packageStore.pricingStrategy?.freePackage.conversionGoals.map((goal, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-300">{goal.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{goal.reasoning}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-4">Paid Package Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-3">Value Metrics</h4>
                <ul className="space-y-2">
                  {packageStore.pricingStrategy?.paidPackage.valueMetrics.map((metric, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-[#FFD23F] text-[#1C1C1C] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-300">{metric.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{metric.reasoning}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-[#1C1C1C] p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-3">Target Conversion Rate</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold text-[#FFD23F]">{packageStore.pricingStrategy?.paidPackage.targetConversion}%</span>
                    <p className="text-xs text-gray-500 mt-1">Based on industry benchmarks and your product's value proposition</p>
                  </div>
                  
                  <AnalysisScoreBox 
                    score={Math.round(componentScores.freeModelCanvas * 10) / 10}
                    label="Package Strategy Score"
                  />
                </div>
                
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Recommendations</h5>
                  <ul className="space-y-2">
                    {componentFeedback.freeModelCanvas.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-300 text-sm">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'action' && (
        <div className="space-y-6">
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Implementation Action Plan</h3>
            
            <div className="space-y-4">
              {actionPlan.map((action, index) => (
                <ActionTask 
                  key={index}
                  number={index + 1}
                  title={action.title}
                  description={action.description}
                  priority={action.priority}
                  effort={action.effort}
                  impact={action.impact}
                />
              ))}
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">User Journey Analysis</h3>
            
            <div className="space-y-8">
              {journeyAnalysis.map((stage, index) => (
                <UserJourneyStage 
                  key={index}
                  number={index + 1}
                  title={stage.title}
                  description={stage.description}
                  kpis={stage.kpis}
                />
              ))}
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Recommended Testing & Validation</h3>
            
            <div className="space-y-4">
              {testing.map((test, index) => (
                <div key={index} className="bg-[#1C1C1C] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">{test.title}</h4>
                  <p className="text-gray-300 mb-3">{test.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {test.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex} 
                        className="px-2 py-1 bg-[#333333] text-xs text-gray-300 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
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

      <button
        onClick={() => setShowVoiceChat(true)}
        className="fixed bottom-4 right-4 p-4 bg-[#FFD23F] text-[#1C1C1C] rounded-full shadow-lg hover:bg-[#FFD23F]/90"
      >
        <Bot className="w-6 h-6" />
      </button>
    </div>
  );
}
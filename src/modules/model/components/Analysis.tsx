import React, { useState, useEffect, useRef } from 'react';
import { useModelInputsStore } from '../store/modelInputsStore';
import { useModelPackagesStore } from '../store/modelPackagesStore';
import { Link } from 'react-router-dom';
import { 
  Loader2, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Share2,
  Link as LinkIcon,
  Save,
  Home,
  Edit,
  Bot,
} from 'lucide-react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { analyzeFormData } from '../services/ai/analysis';
import { AuthModal } from '@/core/auth/AuthModal';
import { useAuth } from '@/core/auth/AuthProvider';
import { getModuleData, saveModuleData } from '@/core/services/supabase';
import type { StoredAnalysis } from '../services/ai/analysis/types';
import { ComponentCard } from './analysis/ComponentCard';
import { VoiceChat } from '@/components/VoiceChat'; // Assuming VoiceChat is in the main components dir

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
  const store = useModelInputsStore();
  const packageStore = useModelPackagesStore();
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'share' | 'export' | 'save' | 'corner-save' | null>(null);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [existingAnalyses, setExistingAnalyses] = useState<any[]>([]);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  // Load existing analyses to check for duplicates
  useEffect(() => {
    if (user) {
      console.warn("Existing analysis loading not implemented with getModuleData yet.");
    }
  }, [user]);

  useEffect(() => {
    const analyzeData = async () => {
      if (isAnalyzing || store.analysis || isShared) return;
      
      const beginnerOutcome = store.outcomes.find((o) => o.level === 'beginner');
      
      if (!store.productDescription || !beginnerOutcome?.text || !store.selectedModel || !store.idealUser) {
        setError("Please complete all previous sections before viewing the analysis.");
        return;
      }

      setIsAnalyzing(true);
      
      try {
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
        
        let analysisId = undefined;
        const analysisTitle = store.title || store.productDescription?.split('\\n')[0].trim() || 'Untitled Analysis';
        
        const combinedData = {
          title: analysisTitle,
          productDescription: store.productDescription,
          idealUser: store.idealUser,
          outcomes: store.outcomes,
          challenges: store.challenges,
          solutions: store.solutions,
          selectedModel: store.selectedModel,
          features: packageStore.features,
          userJourney: store.userJourney,
          pricingStrategy: packageStore.pricingStrategy,
          analysisResults: result
        };

        if (user) {
          try {
            const savedData = await saveModuleData('model', combinedData);
            analysisId = savedData?.id;
            store.setTitle(analysisTitle);
          } catch (saveError) {
             console.error('Error saving analysis data:', saveError);
             setError('Failed to automatically save analysis progress.');
          }
        }

        store.setAnalysis({
          ...result,
          id: analysisId
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
  }, [store, packageStore, isAnalyzing, isShared, user]);

  const handleSave = async () => {
    if (!user) {
      setPendingAction('save');
      setShowAuthModal(true);
      return;
    }
    
    if (!store.title || store.title === 'Untitled Analysis') {
      setShowTitlePrompt(true);
      setPendingAction('save');
      return;
    }

    await performSave();
  };

  const performSave = async () => {
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
        userJourney: store.userJourney,
        pricingStrategy: packageStore.pricingStrategy,
        analysisResults: store.analysis
      };

      const savedData = await saveModuleData('model', analysisData);

      if (savedData) {
        store.setAnalysis(store.analysis ? { ...store.analysis, id: savedData.id } : null);

        const successMessage = document.createElement('div');
        successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
        successMessage.textContent = 'Analysis saved successfully';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
      } else {
        throw new Error("Save operation did not return confirmation.");
      }

    } catch (error) {
      console.error('Error saving analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCornerSave = async () => {
    // Check if user is logged in
    if (!user) {
      setPendingAction('corner-save');
      setShowAuthModal(true);
      return;
    }
    
    // Always prompt for a title for the corner save button
    setShowTitlePrompt(true);
    setPendingAction('corner-save');
  };

  const handleShare = async () => {
    // Check if user is logged in
    if (!user) {
      setPendingAction('share');
      setShowAuthModal(true);
      return;
    }
    
    if (!store.title || store.title === 'Untitled Analysis') {
      setShowTitlePrompt(true);
      setPendingAction('share');
      return;
    }
    
    if (!store.analysis?.id) {
      try {
        const savedAnalysis = await saveModuleData('model', {
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
      // const shareId = await shareAnalysis(store.analysis!.id);
      // const shareUrl = `${window.location.origin}/share/${shareId}`;
      // setShareUrl(shareUrl);
      
      // try {
      //   await navigator.clipboard.writeText(shareUrl);
      //   setShowCopiedMessage(true);
      //   setTimeout(() => setShowCopiedMessage(false), 3000);
      // } catch (clipboardError) {
      //   console.warn('Could not copy to clipboard:', clipboardError);
      //   setError('Failed to copy link automatically. Please use the copy button.');
      // }
    } catch (error) {
      console.error('Share analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to share analysis');
    } finally {
      setIsSharing(false);
    }
  };

  const handleExport = async () => {
    // Check if user is logged in
    if (!user) {
      setPendingAction('export');
      setShowAuthModal(true);
      return;
    }
    
    window.print();
  };

  const handleCopyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      // await navigator.clipboard.writeText(shareUrl);
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
              value={store.title || ''}
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
                  } else if (pendingAction === 'corner-save') {
                    performSave();
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

      {/* Overwrite confirmation modal */}
      {showOverwriteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Overwrite existing analysis?</h3>
            <p className="text-gray-300 mb-6">
              An analysis with the title "{store.title}" already exists. Do you want to overwrite it with your current changes?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowOverwriteConfirm(false);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowOverwriteConfirm(false);
                  performSave();
                }}
                className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth modal */}
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
            else if (pendingAction === 'export') handleExport();
            else if (pendingAction === 'corner-save') handleCornerSave();
            setPendingAction(null);
          }}
        />
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
                {strengths.map((strength: string, index: number) => (
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
                {weaknesses.map((weakness: string, index: number) => (
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
          {Object.entries(componentFeedback).map(([key, feedback]) => (
            <ComponentCard
              key={key}
              title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              score={componentScores[key as keyof typeof componentScores]}
              strengths={feedback.strengths}
              recommendations={feedback.recommendations}
              analysis={feedback.analysis}
            />
          ))}
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="space-y-6">
          {/* Placeholder for package-specific analysis card if needed */}
          <p className="text-gray-400">Package analysis details will be shown here.</p>
        </div>
      )}

      {activeTab === 'action' && (
        <div className="space-y-6">
          <ComponentCard
            title="Implementation Timeline"
            score={100} // Score might not be applicable here, using 100 as placeholder
            strengths={[]} // No direct strengths for timeline
            recommendations={[
              ...(actionPlan.immediate || []).map(a => `Immediate (1-30 days): ${a}`),
              ...(actionPlan.medium || []).map(a => `Medium-term (30-90 days): ${a}`),
              ...(actionPlan.long || []).map(a => `Long-term (90+ days): ${a}`)
            ]}
          />
          <ComponentCard
            title="Testing Framework"
            score={100} // Score might not be applicable here
            strengths={(testing.metrics || []).map(m => `Metric: ${m}`)}
            recommendations={(testing.abTests || []).map(t => `A/B Test: ${t}`)}
          />
        </div>
      )}

      {!isShared && (
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 rounded-lg bg-[#1C1C1C] text-white hover:bg-[#333333]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </button>
            {shareUrl ? (
              <button
                onClick={handleCopyToClipboard}
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
          
          {/* Save button in the corner */}
          <button
            onClick={handleCornerSave}
            className="flex items-center px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Analysis
          </button>
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

      {/* Voice Chat Button */}
      {!isShared && (
        <button
          onClick={() => setShowVoiceChat(!showVoiceChat)}
          className="fixed bottom-4 left-4 bg-[#FFD23F] text-[#1C1C1C] p-3 rounded-full shadow-lg hover:bg-[#FFD23F]/90 transition-colors"
          title="Talk with AI Assistant"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Voice Chat Modal */}
      {showVoiceChat && (
        <VoiceChat
          onClose={() => setShowVoiceChat(false)}
          analysisContext={{
            productDescription: store.productDescription,
            selectedModel: store.selectedModel,
            analysis: store.analysis,
            features: packageStore.features,
            pricingStrategy: packageStore.pricingStrategy
          }}
          // floating={true} // Optional: Set to true if you want the floating style
          // onSwitchToText={() => { /* Handle switching to text chat if needed */ }}
        />
      )}
    </div>
  );
}
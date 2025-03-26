import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useFormStore } from '../stores/formStore';
import { analyzeFormData } from '../services/openai';
import { shareAnalysis, saveAnalysis, updateAnalysis } from '../services/supabase';
import { AuthModal } from './auth/AuthModal';
import { supabase } from '../services/supabase';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { usePackageStore } from '../stores/packageStore';
import { Loading } from './Loading';
import { DownloadIcon, Share2Icon, Save, Mic, X } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { generateExportData } from '../utils/exportUtils';
import { download } from '../utils/downloadUtils';
import { VoiceChat } from './VoiceChat';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analysis = observer(() => {
  const store = useFormStore();
  const packageStore = usePackageStore();
  const { id: sharedId } = useParams();
  const navigate = useNavigate();
  const isShared = !!sharedId;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'share' | null>(null);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
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
        // Generate the analysis - this doesn't require authentication
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
        
        // Check if authenticated AFTER getting the analysis results
        // This means anonymous users still see the analysis
        const { data: { user } } = await supabase.auth.getUser();
        let analysisId = undefined;
        
        // Only attempt database operations if the user is logged in
        if (user) {
          try {
            // First save the base analysis
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
              userJourney: store.userJourney
            };
            
            const savedAnalysis = await saveAnalysis(analysisData);
            analysisId = savedAnalysis.id;
            
            // Then update with the results
            await updateAnalysis(savedAnalysis.id, {
              analysisResults: result
            });
          } catch (dbError) {
            // Don't block rendering due to database errors
            console.error('Database operation failed:', dbError);
            // Just continue with local analysis
          }
        }

        // Always set the analysis in the store, regardless of authentication
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
  }, [store, packageStore, isAnalyzing, isShared]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportData = generateExportData(store, packageStore);
      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `${store.title || 'untitled_analysis'}_export.json`;
      download(jsonString, fileName, 'application/json');
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Show auth modal and set pending action to save
      setPendingAction('save');
      setShowAuthModal(true);
      return;
    }

    if (!store.title) {
      setShowTitlePrompt(true);
      return;
    }

    try {
      setIsSaving(true);
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

      const response = await saveAnalysis(analysisData);
      
      // If we get here, it succeeded
      notifySuccess('Analysis saved successfully');
      console.log('Saved analysis:', response);
      
      // Update the analysis ID in the store
      if (store.analysis) {
        store.setAnalysis({
          ...store.analysis,
          id: response.id
        });
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
      notifyError('Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Show auth modal and set pending action to share
      setPendingAction('share');
      setShowAuthModal(true);
      return;
    }

    // If no analysis ID, we need to save first
    if (!store.analysis?.id) {
      if (!store.title) {
        setShowTitlePrompt(true);
        return;
      }
      
      try {
        setIsSaving(true);
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

        const savedAnalysis = await saveAnalysis(analysisData);
        // If we get here, it succeeded
        console.log('Saved analysis before sharing:', savedAnalysis);
        
        // Update the analysis ID in the store
        if (store.analysis) {
          store.setAnalysis({
            ...store.analysis,
            id: savedAnalysis.id
          });
        }
        
        // Now continue with sharing
        handleShareAnalysis(savedAnalysis.id);
      } catch (error) {
        console.error('Error saving analysis before sharing:', error);
        notifyError('Failed to save analysis before sharing');
        setIsSaving(false);
      }
    } else {
      // Analysis already has ID, proceed with sharing
      handleShareAnalysis(store.analysis.id);
    }
  };

  const handleShareAnalysis = async (analysisId: string) => {
    try {
      setIsSharing(true);
      const shareResponse = await shareAnalysis(analysisId);
      console.log('Share response:', shareResponse);
      
      if (shareResponse.shareId) {
        setShareUrl(`${window.location.origin}/shared/${shareResponse.shareId}`);
        setShowCopiedMessage(true);
        notifySuccess('Analysis shared successfully');
      } else {
        notifyError('Failed to generate sharing link');
      }
    } catch (error) {
      console.error('Error sharing analysis:', error);
      notifyError('Failed to share analysis');
    } finally {
      setIsSharing(false);
      setIsSaving(false); // In case we were saving before sharing
    }
  };

  // Notification utilities
  const notifySuccess = (message: string) => {
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    successMessage.textContent = message;
    document.body.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 3000);
  };

  const notifyError = (message: string) => {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    errorMessage.textContent = message;
    document.body.appendChild(errorMessage);
    setTimeout(() => errorMessage.remove(), 3000);
  };

  const handleTitleSet = () => {
    if (tempTitle) {
      store.setTitle(tempTitle);
      setShowTitlePrompt(false);
      setTempTitle('');

      // Continue with the pending action
      if (pendingAction === 'share') {
        handleShare();
      } else {
        handleSave();
      }
    }
  };

  // Handle user authentication completion
  const handleAuthComplete = (success: boolean) => {
    setShowAuthModal(false);
    
    if (success && pendingAction) {
      // Execute the pending action
      if (pendingAction === 'save') {
        handleSave();
      } else if (pendingAction === 'share') {
        handleShare();
      }
      setPendingAction(null);
    } else {
      setPendingAction(null);
    }
  };

  if (isAnalyzing) {
    return <Loading message="Generating your analysis..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-full">
        <Alert title="Error" message={error} />
        <Button 
          onClick={() => navigate('/form/step/1')} 
          className="mt-4"
        >
          Back to Start
        </Button>
      </div>
    );
  }

  if (!store.analysis) {
    return <Loading message="Loading analysis data..." />;
  }

  return (
    <div className="container mx-auto p-4 mb-16 relative">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {store.title ? `${store.title} - Analysis` : 'Your Analysis'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Product Description</h3>
          <p className="text-gray-700">{store.productDescription}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Ideal User</h3>
          <p className="text-gray-700">{store.idealUser}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
        
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Summary</h4>
          <p className="text-gray-700">{store.analysis.summary}</p>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Strengths</h4>
          <ul className="list-disc pl-6 text-gray-700">
            {store.analysis.strengths.map((strength, index) => (
              <li key={index} className="mb-2">{strength}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Weaknesses</h4>
          <ul className="list-disc pl-6 text-gray-700">
            {store.analysis.weaknesses.map((weakness, index) => (
              <li key={index} className="mb-2">{weakness}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Opportunities</h4>
          <ul className="list-disc pl-6 text-gray-700">
            {store.analysis.opportunities.map((opportunity, index) => (
              <li key={index} className="mb-2">{opportunity}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Threats</h4>
          <ul className="list-disc pl-6 text-gray-700">
            {store.analysis.threats.map((threat, index) => (
              <li key={index} className="mb-2">{threat}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">User Journey Optimization</h4>
          <p className="text-gray-700 mb-4">{store.analysis.userJourneyOptimization}</p>
        </div>
        
        {!isShared && (
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">Model Rating</h4>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <Bar 
                data={{
                  labels: ['Viability', 'Market Fit', 'Value Proposition', 'Pricing Strategy', 'Overall Score'],
                  datasets: [
                    {
                      label: 'Rating (0-10)',
                      data: [
                        store.analysis.viabilityScore,
                        store.analysis.marketFitScore,
                        store.analysis.valuePropositionScore,
                        store.analysis.pricingStrategyScore,
                        store.analysis.overallScore
                      ],
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 10,
                    },
                  },
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: 'Model Evaluation Scores',
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      {!isShared && (
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Analysis'}
          </Button>
          
          <Button
            onClick={handleShare}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            disabled={isSharing}
          >
            <Share2Icon size={16} />
            {isSharing ? 'Sharing...' : 'Share Analysis'}
          </Button>
          
          <Button
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            disabled={isExporting}
          >
            <DownloadIcon size={16} />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      )}
      
      {showCopiedMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Link copied to clipboard!
        </div>
      )}
      
      {showTitlePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Enter a title for your analysis</h3>
            <p className="text-gray-600 mb-4">This will help you identify it later.</p>
            
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="e.g., Project X Analysis"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            
            <div className="flex justify-end gap-3">
              <Button 
                onClick={() => setShowTitlePrompt(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleTitleSet}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!tempTitle}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {showAuthModal && (
        <AuthModal
          onComplete={handleAuthComplete}
          action={pendingAction || 'view'}
        />
      )}
      
      {/* Floating chat button */}
      <div className="fixed bottom-4 right-4 z-10">
        <button
          onClick={() => setShowVoiceChat(!showVoiceChat)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Chat with your data"
        >
          {showVoiceChat ? <X size={24} /> : <Mic size={24} />}
        </button>
      </div>
      
      {showVoiceChat && (
        <div className="fixed bottom-16 right-4 z-10 w-80 md:w-96 bg-white rounded-lg shadow-xl">
          <VoiceChat onClose={() => setShowVoiceChat(false)} />
        </div>
      )}
    </div>
  );
});

export default Analysis;
import React, { useState, useEffect, useRef } from 'react';
import { useFormStore } from '../stores/formStore';
import { usePackageStore } from '../stores/packageStore';
import { 
  Mic, 
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
  Link
} from 'lucide-react';
import { VoiceChat } from './VoiceChat';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { analyzeFormData } from '../services/openai';
import { ComponentCard } from './analysis/ComponentCard';
import { shareAnalysis, saveAnalysis, updateAnalysis } from '../services/supabase';

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
  const packageStore = usePackageStore();
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

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
        // First save the analysis to get an ID
        const savedAnalysis = await saveAnalysis({
          productDescription: store.productDescription,
          idealUser: store.idealUser,
          outcomes: store.outcomes,
          challenges: store.challenges,
          solutions: store.solutions,
          selectedModel: store.selectedModel,
          features: packageStore.features,
          userJourney: store.userJourney,
          analysisResults: null // Initialize as null
        });

        // Then analyze the data
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
        
        // Update the saved analysis with results
        await updateAnalysis(savedAnalysis.id, {
          analysisResults: result
        });

        // Set the analysis in the store with the database ID
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

  const handleShare = async () => {
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
    } catch (error) {
      console.error('Error sharing analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to share analysis');
    } finally {
      setIsSharing(false);
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
}
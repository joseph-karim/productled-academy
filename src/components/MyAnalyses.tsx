import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAnalyses, createAnalysis, deleteAnalysis } from '../services/supabase';
import { Loader2, AlertTriangle, PlusCircle, Trash2, Share2, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function MyAnalyses() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const data = await getAnalyses();
      setAnalyses(data);
      setError(null);
    } catch (error) {
      console.error('Error loading analyses:', error);
      setError('Failed to load your analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      setIsCreating(true);
      const analysis = await createAnalysis();
      navigate(`/analysis/${analysis.id}`);
    } catch (error) {
      console.error('Error creating analysis:', error);
      setError('Failed to create new analysis');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      await deleteAnalysis(id);
      setAnalyses(analyses.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting analysis:', error);
      setError('Failed to delete analysis');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-8 h-8 mx-auto text-[#FFD23F]" />
          <p className="text-gray-400">Please sign in to view your analyses</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD23F]" />
          <p className="text-gray-400">Loading your analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">My Analyses</h1>
        <button
          onClick={handleCreateNew}
          disabled={isCreating}
          className="flex items-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Analysis
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6 flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {analyses.length === 0 ? (
        <div className="text-center py-12 bg-[#2A2A2A] rounded-lg">
          <p className="text-gray-400">You haven't created any analyses yet.</p>
          <button
            onClick={handleCreateNew}
            className="mt-4 text-[#FFD23F] hover:text-[#FFD23F]/80"
          >
            Create your first analysis
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="bg-[#2A2A2A] p-6 rounded-lg border border-[#333333] hover:border-[#FFD23F] transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-white">
                    {analysis.product_description || 'Untitled Analysis'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Created {new Date(analysis.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {analysis.is_public && (
                    <Link
                      to={`/share/${analysis.share_id}`}
                      target="_blank"
                      className="p-2 text-[#FFD23F] hover:text-[#FFD23F]/80"
                      title="View shared analysis"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  )}
                  <Link
                    to={`/analysis/${analysis.id}`}
                    className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
                  >
                    Continue
                  </Link>
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 text-red-400 hover:text-red-300"
                    title="Delete analysis"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
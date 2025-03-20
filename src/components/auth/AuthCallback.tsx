import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Exchange code for session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        // Get URL params
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next') || '/';

        // Redirect to the requested page or home
        navigate(next);
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD23F]" />
        <p className="text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
}
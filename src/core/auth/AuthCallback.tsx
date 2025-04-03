import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/core/services/supabase';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session) {
          // If we have a session, redirect to the app
          navigate('/app', { replace: true });
        } else {
          // Check if this is a password reset
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const type = hashParams.get('type');
          
          if (type === 'recovery') {
            // Redirect to password reset page with the token
            navigate('/auth/reset-password', { 
              replace: true,
              state: { 
                access_token: hashParams.get('access_token'),
                refresh_token: hashParams.get('refresh_token')
              }
            });
          } else {
            // For other cases (like email confirmation), check session again after a delay
            setTimeout(async () => {
              const { data: { session: delayedSession } } = await supabase.auth.getSession();
              if (delayedSession) {
                navigate('/app', { replace: true });
              } else {
                setError('Authentication failed. Please try logging in again.');
              }
            }, 1000);
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError((err as Error).message || 'Authentication failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C]">
        <div className="bg-[#2A2A2A] p-8 rounded-lg shadow-lg max-w-md w-full">
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg font-medium hover:bg-opacity-90"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#FFD23F] animate-spin" />
        <p className="text-gray-300">Completing authentication...</p>
      </div>
    </div>
  );
} 
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...');

        // Get URL parameters
        const type = searchParams.get('type');
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        // Handle errors from auth provider
        if (error) {
          throw new Error(error_description || error);
        }

        // Handle auth code if present
        if (code) {
          console.log('Found auth code, exchanging for session');
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // Handle different auth types
        switch (type) {
          case 'recovery':
            // Password reset flow
            if (session) {
              navigate('/auth/reset-password', { replace: true });
            } else {
              throw new Error('No session found for password reset');
            }
            break;

          case 'magiclink':
            // Magic link flow
            if (session) {
              navigate('/', { replace: true });
            } else {
              throw new Error('No session found for magic link');
            }
            break;

          default:
            // Default redirect
            navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        // Redirect to home with error after a delay
        setTimeout(() => {
          navigate('/', { 
            replace: true,
            state: { authError: error instanceof Error ? error.message : 'Authentication failed' }
          });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
          <p className="text-red-400">{error}</p>
          <p className="text-sm text-gray-400">Redirecting you back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD23F]" />
        <p className="text-gray-400">Completing authentication...</p>
        <p className="text-sm text-gray-500">This may take a moment...</p>
      </div>
    </div>
  );
}
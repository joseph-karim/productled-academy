import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useAuth() {
  const { 
    isAuthenticated, 
    getAccessTokenSilently, 
    user: auth0User,
    loginWithPopup,
    logout,
    error: auth0Error
  } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      const setupSupabase = async () => {
        try {
          // Get the JWT token from Auth0
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/`,
              scope: 'openid profile email'
            }
          });

          // Get the ID token which contains user claims
          const { id_token } = await getAccessTokenSilently({
            detailedResponse: true
          });
          
          // Set up Supabase session using the ID token
          await supabase.auth.setSession({
            access_token: id_token,
            refresh_token: '' // Not needed with Auth0
          });
        } catch (error) {
          console.error('Error setting up Supabase auth:', error);
        }
      };

      setupSupabase();
    }
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  const signIn = async () => {
    try {
      await loginWithPopup({
        authorizationParams: {
          prompt: 'login',
          audience: `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/`,
          scope: 'openid profile email'
        }
      });
    } catch (error) {
      console.error('Auth0 login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Sign out from both Auth0 and Supabase
      await Promise.all([
        logout({ 
          logoutParams: { 
            returnTo: window.location.origin 
          } 
        }),
        supabase.auth.signOut()
      ]);
    } catch (error) {
      console.error('Auth0 logout error:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    user: auth0User,
    signIn,
    signOut,
    error: auth0Error
  };
}
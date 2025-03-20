import { Auth0Client } from '@auth0/auth0-spa-js';
import { supabase } from './supabase';

if (!import.meta.env.VITE_AUTH0_DOMAIN || !import.meta.env.VITE_AUTH0_CLIENT_ID) {
  throw new Error('Missing Auth0 environment variables');
}

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const currentDomain = window.location.origin;

export const auth0 = new Auth0Client({
  domain: domain,
  clientId: clientId,
  authorizationParams: {
    redirect_uri: currentDomain,
    audience: `https://${domain}/api/v2/`,
    scope: 'openid profile email'
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
  httpTimeoutInSeconds: 60,
  // Enable cross-origin authentication
  crossOrigin: true
});

export async function configureSupabaseAuth() {
  try {
    const accessToken = await auth0.getTokenSilently({
      authorizationParams: {
        audience: `https://${domain}/api/v2/`,
        scope: 'openid profile email'
      }
    });
    
    // Configure Supabase client to use Auth0 access token
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '', // Not needed with Auth0
    });
  } catch (error) {
    console.error('Error configuring Supabase auth:', error);
    throw error;
  }
}

export async function loginWithAuth0() {
  try {
    await auth0.loginWithPopup({
      authorizationParams: {
        redirect_uri: currentDomain,
        prompt: 'login'
      }
    });
    await configureSupabaseAuth();
    return true;
  } catch (error) {
    console.error('Auth0 login error:', error);
    throw error;
  }
}

export async function logoutWithAuth0() {
  try {
    await auth0.logout({
      logoutParams: {
        returnTo: currentDomain,
      },
    });
    // Clear Supabase session
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Auth0 logout error:', error);
    throw error;
  }
}

export async function getAuth0User() {
  try {
    const user = await auth0.getUser();
    return user;
  } catch (error) {
    console.error('Error getting Auth0 user:', error);
    return null;
  }
}
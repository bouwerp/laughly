import { IAuthService, AuthSession } from '../../core/interfaces/IAuthService';
import { supabase } from '../SupabaseClient';
import { Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export class SupabaseAuthAdapter implements IAuthService {
  private googleSigninModule: any = null;
  private authChangeCallback: ((session: AuthSession | null) => void) | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initGoogle();
  }

  private async initGoogle() {
    try {
      // Lazy load to avoid RNGoogleSignin missing error in Expo Go
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      this.googleSigninModule = GoogleSignin;
      
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

      console.log('GoogleSignin.configure with:', {
        webClientId: webClientId || 'MISSING',
        iosClientId: iosClientId || 'MISSING',
      });

      if (!webClientId) {
        console.warn('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing from environment variables.');
      }

      this.googleSigninModule.configure({
        webClientId: webClientId,
        iosClientId: iosClientId,
        offlineAccess: true, // Often helps with getting idToken reliably
      });
    } catch (e) {
      console.warn('GoogleSignin native module not available in this environment.');
      this.googleSigninModule = null;
    }
  }

  async signInWithGoogle(): Promise<AuthSession> {
    try {
      console.log('Initiating WebBrowser OAuth flow...');
      
      // Force the custom scheme to bypass Supabase's rejection of 'exp+' URLs
      // Since 'laughly://' is in your Supabase Dashboard, this will be accepted.
      const redirectUrl = 'laughly://(tabs)';
      
      console.log('Redirecting back to:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // Generate the URL, but don't open it automatically
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL returned from Supabase.');

      console.log('\n=== OAUTH URL GENERATED ===');
      console.log(data.url);
      console.log('===========================\n');

      // Open the browser for the user to authenticate
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        console.log('OAuth successful, parsing URL for session tokens...');
        
        // Supabase v2 implicit grant returns session data in the URL hash fragment
        const urlParams = result.url.includes('#') ? result.url.split('#')[1] : result.url.split('?')[1];
        
        if (!urlParams) throw new Error('No session parameters found in redirect URL.');

        const paramMap: Record<string, string> = {};
        urlParams.split('&').forEach(pair => {
          const [key, val] = pair.split('=');
          if (key && val) paramMap[key] = decodeURIComponent(val);
        });

        // Set the session manually using the tokens from the URL
        if (paramMap.access_token && paramMap.refresh_token) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: paramMap.access_token,
            refresh_token: paramMap.refresh_token,
          });
          
          if (sessionError) throw sessionError;
          if (!sessionData.session) throw new Error('Failed to set session from tokens.');
          
          return this.mapSession(sessionData.session);
        } else {
          throw new Error('Could not find access_token and refresh_token in redirect URL.');
        }
      } else {
        throw new Error('Sign-in was cancelled or failed.');
      }
    } catch (error) {
      console.error('Google OAuth Error:', error);
      throw error;
    }
  }

  private async mockSignIn(): Promise<AuthSession> {
    console.log("Mock Sign-In active - establishing real Supabase session for local dev");
    
    try {
      // Use the test user created in the local migration
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      if (error) {
        console.warn('Local test user sign-in failed. Falling back to simple mock.', error.message);
        // Fallback to pure mock if the user doesn't exist (e.g. in cloud environment)
        const mockSession: AuthSession = {
          user: {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'test@example.com',
            name: 'Test User (Mock)',
            avatarUrl: 'https://bananiraw.s3.us-west-2.amazonaws.com/avatar-mock.png',
          },
          accessToken: 'mock-token',
        };
        if (this.authChangeCallback) this.authChangeCallback(mockSession);
        return mockSession;
      }

      return this.mapSession(data.session);
    } catch (e) {
      console.error('Mock sign-in error:', e);
      throw e;
    }
  }

  async signOut(): Promise<void> {
    if (this.googleSigninModule) {
      try {
        await this.googleSigninModule.signOut();
      } catch (e) {
        console.error('Sign out from Google failed', e);
      }
    }
    await supabase.auth.signOut();
    if (this.authChangeCallback) {
      this.authChangeCallback(null);
    }
  }

  async getSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase getSession error:', error.message);
        return null;
      }
      if (!data.session) return null;
      return this.mapSession(data.session);
    } catch (e) {
      console.error('Unexpected error in getSession:', e);
      return null;
    }
  }

  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    this.authChangeCallback = callback;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase Auth State Change:', event);
      try {
        const mapped = session ? this.mapSession(session) : null;
        callback(mapped);
      } catch (e) {
        console.error('Error mapping session in onAuthStateChange:', e);
        // Don't crash the whole app if mapping fails
      }
    });

    return () => data.subscription.unsubscribe();
  }

  private mapSession(session: any): AuthSession {
    if (!session || !session.user) {
      console.error('mapSession called with invalid session:', JSON.stringify(session));
      throw new Error('Invalid session: missing user data');
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
        avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
      },
      accessToken: session.access_token || '',
    };
  }
}

import { IAuthService, AuthSession } from '../../core/interfaces/IAuthService';
import { supabase } from '../SupabaseClient';
import { Alert } from 'react-native';

export class SupabaseAuthAdapter implements IAuthService {
  private googleSigninModule: any = null;

  constructor() {
    this.initGoogle();
  }

  private async initGoogle() {
    try {
      // Lazy load to avoid RNGoogleSignin missing error in Expo Go
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      this.googleSigninModule = GoogleSignin;
      
      this.googleSigninModule.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      });
    } catch (e) {
      console.warn('GoogleSignin native module not available in this environment.');
    }
  }

  async signInWithGoogle(): Promise<AuthSession> {
    if (!this.googleSigninModule) {
      Alert.alert(
        "Development Mode",
        "Google Sign-In requires a Development Build (EAS). It is not supported in Expo Go."
      );
      throw new Error('Native GoogleSignin module not available');
    }

    try {
      await this.googleSigninModule.hasPlayServices();
      const userInfo = await this.googleSigninModule.signIn();
      
      if (!userInfo.data?.idToken) {
        throw new Error('No ID token present from Google Sign-In.');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });

      if (error) throw error;
      if (!data.session) throw new Error('No session returned after Google Sign-In.');

      return this.mapSession(data.session);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
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
  }

  async getSession(): Promise<AuthSession | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    return this.mapSession(data.session);
  }

  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session ? this.mapSession(session) : null);
    });

    return () => data.subscription.unsubscribe();
  }

  private mapSession(session: any): AuthSession {
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
      },
      accessToken: session.access_token,
    };
  }
}

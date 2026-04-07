import { IAuthService, AuthSession } from '../../core/interfaces/IAuthService';
import { supabase } from '../SupabaseClient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Alert, Platform } from 'react-native';

export class SupabaseAuthAdapter implements IAuthService {
  private isNativeModuleAvailable = false;

  constructor() {
    try {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      });
      this.isNativeModuleAvailable = true;
    } catch (e) {
      console.warn('GoogleSignin native module not found. Authentication will be disabled.');
      this.isNativeModuleAvailable = false;
    }
  }

  async signInWithGoogle(): Promise<AuthSession> {
    if (!this.isNativeModuleAvailable) {
      Alert.alert(
        "Development Mode",
        "Google Sign-In requires a Development Build (EAS). It is not supported in Expo Go.\n\nWould you like to use a test session?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Use Test Session", onPress: () => this.mockSignIn() }
        ]
      );
      throw new Error('Native GoogleSignin module not available');
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
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

  private async mockSignIn(): Promise<AuthSession> {
    // For local dev in Expo Go, we can sign in with a test account if you have one enabled in Supabase
    // Or we can just return a dummy session if we want to bypass auth for UI testing.
    console.log("Mock Sign-In triggered");
    throw new Error("Mock Sign-In not fully implemented. Please use a Dev Build for real Auth.");
  }

  async signOut(): Promise<void> {
    if (this.isNativeModuleAvailable) {
      await GoogleSignin.signOut();
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

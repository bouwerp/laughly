import { IAuthService, AuthSession } from '../../core/interfaces/IAuthService';
import { supabase } from '../SupabaseClient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export class SupabaseAuthAdapter implements IAuthService {
  constructor() {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }

  async signInWithGoogle(): Promise<AuthSession> {
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

  async signOut(): Promise<void> {
    await GoogleSignin.signOut();
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

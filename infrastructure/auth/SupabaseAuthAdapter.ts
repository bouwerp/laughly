import { IAuthService, AuthSession } from '../../core/interfaces/IAuthService';
import { supabase } from '../SupabaseClient';

export class SupabaseAuthAdapter implements IAuthService {
  async signInWithGoogle(): Promise<AuthSession> {
    // This will be implemented in Phase 2 using @react-native-google-signin/google-signin
    // For now, it's a placeholder to satisfy the interface.
    throw new Error('Google Sign-In not yet implemented.');
  }

  async signInWithApple(): Promise<AuthSession> {
    // This will be implemented in Phase 2 using expo-apple-authentication
    throw new Error('Apple Sign-In not yet implemented.');
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getSession(): Promise<AuthSession | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;

    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        name: data.session.user.user_metadata?.full_name,
        avatarUrl: data.session.user.user_metadata?.avatar_url,
      },
      accessToken: data.session.access_token,
    };
  }

  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        callback(null);
      } else {
        callback({
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name,
            avatarUrl: session.user.user_metadata?.avatar_url,
          },
          accessToken: session.access_token,
        });
      }
    });

    return () => data.subscription.unsubscribe();
  }
}

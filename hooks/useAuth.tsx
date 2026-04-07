import { useState, useEffect, createContext, useContext } from 'react';
import { AuthSession } from '../core/interfaces/IAuthService';
import { services } from '../services/ServiceContainer';

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    services.authService.getSession().then((session) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for changes
    const unsubscribe = services.authService.onAuthStateChange((session) => {
      setSession(session);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await services.authService.signInWithGoogle();
    } catch (error) {
      console.error('Sign in with Google failed', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      await services.authService.signInWithApple();
    } catch (error) {
      console.error('Sign in with Apple failed', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await services.authService.signOut();
    } catch (error) {
      console.error('Sign out failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signInWithGoogle, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

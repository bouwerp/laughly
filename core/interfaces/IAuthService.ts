export interface User {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  user: User | null;
  accessToken?: string;
}

export interface IAuthService {
  signInWithGoogle(): Promise<AuthSession>;
  signInWithApple(): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void;
}

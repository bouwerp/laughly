import FontAwesome from '@expo/vector-icons/FontAwesome';
import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useRouter, useSegments, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useShareIntent } from 'expo-share-intent';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '../hooks/useAuth';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

/**
 * Root Provider wrapper to ensure all hooks (useAuth, useJokes, etc.) 
 * have access to their respective contexts.
 */
export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { session, isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { hasShareIntent } = useShareIntent();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inShareGroup = segments[0] === 'share';

    // Handle Share Intent Redirection
    if (hasShareIntent && !inShareGroup) {
      router.replace('/share');
      return;
    }

    if (!session && !inAuthGroup && !inShareGroup) {
      // Redirect to the login page if the user is not authenticated
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect to the home page if the user is authenticated
      router.replace('/(tabs)');
    }
  }, [session, authLoading, segments, hasShareIntent]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="share" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

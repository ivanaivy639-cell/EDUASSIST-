import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/src/context';
import { LoadingOverlay } from '@/src/components/feedback/LoadingOverlay';
import { useAuth } from '@/src/hooks/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

function AuthNavigation() {
  const { state } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (state.isLoading || state.isCheckingProfile) return;

    const isLogin = segments[0] === 'login';
    const isRegister = segments[0] === 'register-teacher';
    const isIndex = segments.length === 0 || segments[0] === 'index';

    // Defer routing to prevent navigation state conflicts during render
    const timeoutId = setTimeout(() => {
      if (!state.isAuthenticated) {
        if (!isLogin) {
          router.replace('/login');
        }
      } else if (state.hasTeacherProfile !== null) {
        if (state.hasTeacherProfile) {
          // L'utilisateur est connecté et a un profil, il ne doit pas rester sur les pages d'auth/accueil
          if (isLogin || isRegister || isIndex) {
            router.replace('/home');
          }
        } else {
          if (!isRegister) {
            router.replace('/register-teacher');
          }
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [state.isAuthenticated, state.hasTeacherProfile, state.isLoading, state.isCheckingProfile, segments, router]);

  const showLoading = state.isLoading || (state.isAuthenticated && state.hasTeacherProfile === null);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register-teacher" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <LoadingOverlay visible={showLoading} message="Chargement de votre espace..." />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthNavigation />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

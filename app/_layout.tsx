import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/src/context';
import { LoadingOverlay } from '@/src/components/feedback/LoadingOverlay';
import { useAuth } from '@/src/hooks/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';

function AuthNavigation() {
  const { state } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (state.isLoading || state.isCheckingProfile) return;

    const isLogin = segments[0] === 'login';
    const isRegister = (segments[0] as string) === 'register-teacher';
    const isIndex = !segments[0] || (segments[0] as string) === 'index';

    const timeoutId = setTimeout(() => {
      if (!state.isAuthenticated) {
        if (!isLogin) {
          router.replace('/login');
        }
      } else if (state.hasTeacherProfile !== null) {
        if (state.hasTeacherProfile) {
          if (isLogin || isRegister || isIndex) {
            router.replace('/(tabs)/home');
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

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register-teacher" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {(state.isLoading || state.isCheckingProfile) && (
        <LoadingOverlay message="Chargement de votre espace..." />
      )}
    </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

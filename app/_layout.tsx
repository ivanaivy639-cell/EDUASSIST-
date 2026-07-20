import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/src/context';
import { LoadingOverlay } from '@/src/components/feedback/LoadingOverlay';
import { useAuth } from '@/src/hooks/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';

function AuthNavigation() {
  const { state } = useAuth();

  // Do not expose a route while the saved session or teacher profile is still
  // being restored. This prevents the login screen from flashing or remaining
  // active between a successful login and its destination.
  if (state.isLoading || (state.isAuthenticated && state.hasTeacherProfile === null)) {
    return <LoadingOverlay message="Chargement de votre espace..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The index route is the safe anchor used by Expo Router after a guard changes. */}
      <Stack.Screen name="index" />

      <Stack.Protected guard={!state.isAuthenticated}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={state.isAuthenticated && state.hasTeacherProfile === false}>
        <Stack.Screen name="register-teacher" />
      </Stack.Protected>

      <Stack.Protected guard={state.isAuthenticated && state.hasTeacherProfile === true}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
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

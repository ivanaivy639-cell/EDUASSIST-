import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import { LoginScreen } from '@/src/features/auth/LoginScreen';
import { LoadingOverlay } from '@/src/components/feedback/LoadingOverlay';
import { useAuth } from '@/src/hooks/useAuth';

export default function LoginPage() {
  const { state, checkProfile } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated && state.hasTeacherProfile === null && !state.isCheckingProfile) {
      void checkProfile();
    }
  }, [checkProfile, state.hasTeacherProfile, state.isAuthenticated, state.isCheckingProfile]);

  if (state.isLoading || state.isCheckingProfile || (state.isAuthenticated && state.hasTeacherProfile === null)) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Verification du profil..." />
      </View>
    );
  }

  if (state.isAuthenticated && state.hasTeacherProfile !== null) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Connexion reussie, redirection..." />
      </View>
    );
  }

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

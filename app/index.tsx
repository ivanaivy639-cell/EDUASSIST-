import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/src/hooks/useAuth';
import { LoadingOverlay } from '@/src/components/feedback/LoadingOverlay';

export default function Index() {
  const { state } = useAuth();

  if (state.isLoading || state.isCheckingProfile) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Chargement..." />
      </View>
    );
  }

  if (!state.isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (state.hasTeacherProfile) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/register-teacher" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

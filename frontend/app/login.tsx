import React, { useEffect } from 'react';
import { Redirect, type Href } from 'expo-router';

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
    return <LoadingOverlay message="Verification du profil..." />;
  }

  if (state.isAuthenticated && state.hasTeacherProfile !== null) {
    return <LoadingOverlay message="Connexion reussie, redirection..." />;
  }

  return <LoginScreen />;
}

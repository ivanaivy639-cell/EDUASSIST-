import React from 'react';
import { Redirect, type Href } from 'expo-router';

import { useAuth } from '@/src/hooks/useAuth';
import { LoadingOverlay } from '@/src/components/feedback/LoadingOverlay';

export default function Index() {
  const { state } = useAuth();

  console.log('APP INDEX RENDER - isLoading=', state.isLoading, 'isAuthenticated=', state.isAuthenticated);

  if (state.isLoading || state.isCheckingProfile) {
    return <LoadingOverlay message="Chargement..." />;
  }

  return <LoadingOverlay message="Chargement..." />;
}

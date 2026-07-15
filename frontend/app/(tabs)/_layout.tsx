import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { LoadingOverlay } from '@/src/components/feedback/LoadingOverlay';
import { useAuth } from '@/src/hooks/useAuth';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#141414';
const MUTED = '#8F8F8F';

export default function TabLayout() {
  const { state } = useAuth();

  if (state.isLoading || state.isCheckingProfile) {
    return <LoadingOverlay message="Chargement..." />;
  }

  if (!state.isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (state.hasTeacherProfile === false) {
    return <Redirect href="/register-teacher" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          backgroundColor: BLACK,
          borderTopColor: FIELD,
          minHeight: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'IA',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="sparkles-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

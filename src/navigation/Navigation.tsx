import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../features/auth/LoginScreen';
import { RegisterTeacherScreen } from '../features/teacher/RegisterTeacherScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';
import type { RootStackParamList, BottomTabParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const AppTabs = React.memo(() => (
  <Tab.Navigator>
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Accueil' }} />
  </Tab.Navigator>
));

AppTabs.displayName = 'AppTabs';

export const Navigation = React.memo(() => {
  const { state } = useAuth();

  if (state.isLoading) {
    return <LoadingOverlay message="Chargement..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!state.isAuthenticated ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : state.hasTeacherProfile === false ? (
          <Stack.Screen name="RegisterTeacher" component={RegisterTeacherScreen} />
        ) : (
          <Stack.Screen name="App" component={AppTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

Navigation.displayName = 'Navigation';

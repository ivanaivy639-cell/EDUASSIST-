import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../features/auth/LoginScreen';
import { RegisterTeacherScreen } from '../features/teacher/RegisterTeacherScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { ClassesScreen } from '../features/classes/ClassesScreen';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';
import { colors } from '../theme/colors';
import type { RootStackParamList, BottomTabParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const AppTabs = React.memo(() => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        paddingBottom: 4,
        height: 60,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any = 'home-outline';
        if (route.name === 'HomeTab') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'ClassesTab') {
          iconName = focused ? 'school' : 'school-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{ title: 'Accueil' }}
    />
    <Tab.Screen
      name="ClassesTab"
      component={ClassesScreen}
      options={{ title: 'Classes' }}
    />
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

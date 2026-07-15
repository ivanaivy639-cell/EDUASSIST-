import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const HomeScreen = React.memo(() => {
  const { state, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Bienvenue, {state.user?.name || 'Enseignant'} !</Text>
        <Text style={styles.email}>{state.user?.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>Tableau de bord EduAssist</Text>
        <Text style={styles.subtext}>Votre espace de travail pedagogique</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Se deconnecter" onPress={logout} />
      </View>
    </SafeAreaView>
  );
});

HomeScreen.displayName = 'HomeScreen';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.primary,
  },
  welcome: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    color: '#FFFFFF',
  },
  email: {
    fontSize: typography.size.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  text: {
    fontSize: typography.size.subtitle,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  subtext: {
    fontSize: typography.size.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.xl,
  },
});

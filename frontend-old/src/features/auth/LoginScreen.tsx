import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { GoogleButton } from '../../components/buttons/GoogleButton';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const LoginScreen = React.memo((): JSX.Element => {
  const { login, status } = useAuth();
  const isLoading = status === 'authenticating';

  const handleLogin = useCallback(async () => {
    try {
      await login();
    } catch (error) {
      Alert.alert(
        'Erreur de connexion',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    }
  }, [login]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2563EB', '#60A5FA']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>EduAssist</Text>
            <Text style={styles.subtitle}>
              Votre assistant pedagogique intelligent
            </Text>
          </View>

          <View style={styles.form}>
            <GoogleButton onPress={handleLogin} loading={isLoading} />
            <Text style={styles.terms}>
              En vous connectant, vous acceptez nos conditions d'utilisation
            </Text>
          </View>
        </View>
      </LinearGradient>

      {isLoading && <LoadingOverlay message="Connexion en cours..." />}
    </SafeAreaView>
  );
});

LoginScreen.displayName = 'LoginScreen';

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size.hero,
    fontWeight: typography.weight.bold,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: typography.size.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  form: { gap: spacing.md },
  terms: {
    fontSize: typography.size.caption,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});

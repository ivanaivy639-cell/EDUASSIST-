import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter, type Href } from 'expo-router';

import { GoogleButton } from '../../components/buttons/GoogleButton';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { useAuth } from '../../hooks/useAuth';
import { spacing } from '../../theme/spacing';
import { useGoogleAuth } from '../../../hooks/useGoogleAuth';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#242424';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const GREEN = '#45B66F';
const WHITE = '#FFFFFF';

type GoogleAuthResult = {
  authentication?: {
    accessToken?: string | null;
    idToken?: string | null;
  } | null;
  params?: {
    access_token?: string;
    id_token?: string;
  };
};

const getGoogleTokens = (result: GoogleAuthResult): {
  accessToken?: string | null;
  idToken?: string | null;
} => ({
  accessToken: result.authentication?.accessToken || result.params?.access_token || null,
  idToken: result.authentication?.idToken || result.params?.id_token || null,
});

export const LoginScreen = React.memo(() => {
  const router = useRouter();
  const { login, state, status } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();
  const isProcessingRef = useRef(false);
  const handledGoogleResponseRef = useRef<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isLoading = status === 'authenticating' || isProcessingGoogle;

  const markGoogleResponseHandled = useCallback((tokens: {
    accessToken?: string | null;
    idToken?: string | null;
  }): boolean => {
    const responseKey = tokens.idToken || tokens.accessToken;

    if (!responseKey) {
      return false;
    }

    if (handledGoogleResponseRef.current === responseKey) {
      return false;
    }

    handledGoogleResponseRef.current = responseKey;
    return true;
  }, []);

  const completeGoogleLogin = useCallback(async (tokens: {
    accessToken?: string | null;
    idToken?: string | null;
  }): Promise<void> => {
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    setIsProcessingGoogle(true);
    setErrorMessage(null);
    try {
      await login(tokens);
      // Redirection is now automatically handled globally by _layout.tsx
      // based on state.isAuthenticated and state.hasTeacherProfile
    } catch (error) {
      console.error('Google Login Error:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      setErrorMessage(message);
      Alert.alert('Erreur de connexion', message);
    } finally {
      isProcessingRef.current = false;
      setIsProcessingGoogle(false);
    }
  }, [login]);

  const handleGoogleAuth = useCallback(async () => {
    try {
      setErrorMessage(null);
      const result = await promptAsync();

      if (result.type !== 'success') {
        throw new Error('Connexion Google annulee ou token indisponible.');
      }

      const googleTokens = getGoogleTokens(result);

      if (!googleTokens.idToken && !googleTokens.accessToken) {
        throw new Error('Connexion Google confirmee, mais token Google indisponible.');
      }

      if (!markGoogleResponseHandled(googleTokens)) {
        return;
      }

      await completeGoogleLogin(googleTokens);
    } catch (error) {
      console.error('Google Auth UI Error:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      setErrorMessage(message);
      Alert.alert('Erreur de connexion', message);
    }
  }, [completeGoogleLogin, markGoogleResponseHandled, promptAsync]);

  const handlePasswordLogin = useCallback(() => {
    Alert.alert(
      'Connexion Google requise',
      'Pour le moment, EduAssist utilise la connexion securisee Google. La connexion par mot de passe pourra etre ajoutee au backend plus tard.'
    );
  }, []);

  const handleForgotPassword = useCallback(() => {
    Alert.alert(
      'Mot de passe oublie',
      'Votre acces EduAssist passe par Google. Utilisez la recuperation de compte Google si vous avez perdu votre mot de passe Gmail.'
    );
  }, []);



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <View style={styles.logoBlock}>
            <MaterialCommunityIcons name="book-open-variant" size={48} color={GOLD} />
            <Text style={styles.logoText}>EduAssist</Text>
            <Text style={styles.caption}>Accedez a votre espace enseignant en toute securite.</Text>
          </View>

          <Text style={styles.title}>Connexion</Text>

          <View style={styles.form}>
            <View
              style={[
                styles.inputShell,
                focusedField === 'email' && styles.focusedInput,
              ]}
            >
              <Ionicons name="mail-outline" size={22} color={focusedField === 'email' ? GOLD : MUTED} />
              <View style={styles.inputBlock}>
                <Text style={[styles.inputLabel, focusedField === 'email' && styles.focusedLabel]}>
                  Adresse Gmail
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="enseignant@gmail.com"
                  placeholderTextColor={MUTED}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View
              style={[
                styles.inputShell,
                focusedField === 'password' && styles.focusedInput,
              ]}
            >
              <Ionicons name="lock-closed-outline" size={22} color={focusedField === 'password' ? GOLD : MUTED} />
              <View style={styles.inputBlock}>
                <Text style={[styles.inputLabel, focusedField === 'password' && styles.focusedLabel]}>
                  Mot de passe
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre mot de passe"
                  placeholderTextColor={MUTED}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowPassword((current) => !current)}
                disabled={isLoading}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={MUTED} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword} disabled={isLoading}>
              <Text style={styles.linkText}>Mot de passe oublie ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handlePasswordLogin}
              disabled={isLoading}
              activeOpacity={0.86}
            >
              <LinearGradient
                colors={['#F7DA73', '#D4AF37', '#AA8C1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.createButtonText}>Se connecter</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.divider} />
            </View>

            <GoogleButton onPress={handleGoogleAuth} loading={isLoading} disabled={!request} />

            {errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#FF4B4B" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark" size={18} color={GREEN} />
                <Text style={styles.infoText}>Connexion securisee et verifiee par Google</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={18} color={GOLD} />
                <Text style={styles.infoText}>Creation automatique du profil enseignant apres connexion</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Nouveau sur EduAssist ?</Text>
              <TouchableOpacity onPress={handleGoogleAuth} disabled={isLoading || !request}>
                <Text style={styles.footerAction}>Creer un compte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {isLoading && <LoadingOverlay message="Connexion en cours..." />}
    </SafeAreaView>
  );
});

LoginScreen.displayName = 'LoginScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 520,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoText: {
    color: GOLD,
    fontSize: 42,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  caption: {
    color: MUTED,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  title: {
    color: WHITE,
    fontSize: 50,
    fontWeight: '800',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 78,
    paddingHorizontal: spacing.lg,
  },
  focusedInput: {
    borderColor: GOLD,
    borderWidth: 2,
  },
  inputBlock: {
    flex: 1,
    marginLeft: spacing.md,
  },
  inputLabel: {
    color: MUTED,
    fontSize: 13,
    marginBottom: 2,
  },
  focusedLabel: {
    color: GOLD,
  },
  input: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '600',
    padding: 0,
  },
  iconButton: {
    padding: spacing.sm,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
  },
  infoCard: {
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 28,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    color: MUTED,
    fontSize: 15,
    flexShrink: 1,
  },
  createButton: {
    borderRadius: 34,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 78,
    paddingHorizontal: spacing.lg,
  },
  createButtonText: {
    color: BLACK,
    fontSize: 24,
    fontWeight: '800',
  },
  linkText: {
    color: GOLD,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  divider: {
    backgroundColor: FIELD_BORDER,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  footerText: {
    color: MUTED,
    fontSize: 14,
  },
  footerAction: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.3)',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 14,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

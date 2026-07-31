import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';

import { LoadingOverlay } from '@/src/components/feedback/LoadingOverlay';
import { useAuth } from '@/src/hooks/useAuth';
import { spacing } from '@/src/theme/spacing';
import type { RegisterTeacherData } from '@/src/types/auth.types';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#242424';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const GREEN = '#45B66F';
const RED = '#FF4D4D';

const initialForm: RegisterTeacherData = {
  nom: '',
  prenom: '',
  telephone: '',
};
type FieldName = keyof RegisterTeacherData;

const fields: Array<{
  name: FieldName;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
}> = [
    { name: 'nom', label: 'Nom', placeholder: 'Entrez votre nom' },
    { name: 'prenom', label: 'Prenom', placeholder: 'Entrez votre prenom' },
    { name: 'telephone', label: 'Telephone', placeholder: '6 ....', keyboardType: 'phone-pad' },
  ];

const getFieldError = (name: FieldName, value: string): string | null => {
  // Aucune validation stricte côté client, on accepte tout.
  return null;
};

export default function RegisterTeacherPage() {
  const { state, registerTeacher, status, logout } = useAuth();
  const [form, setForm] = useState<RegisterTeacherData>(initialForm);
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isLoading = status === 'registeringTeacher';

  const errors = useMemo(
    () =>
      fields.reduce<Record<FieldName, string | null>>((current, field) => {
        current[field.name] = getFieldError(field.name, form[field.name]);
        return current;
      }, {} as Record<FieldName, string | null>),
    [form]
  );

  const isValid = useMemo(
    () => fields.every((field) => form[field.name].trim().length > 0),
    [form]
  );

  const updateField = useCallback((name: FieldName, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);

    try {
      await registerTeacher({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        telephone: form.telephone.trim(),
      });

      router.replace('/home' as Href);
    } catch (error) {
      Alert.alert(
        'Inscription impossible',
        error instanceof Error ? error.message : 'Une erreur est survenue.'
      );
    }
  }, [form, isValid, registerTeacher]);

  const handleBack = useCallback(async () => {
    await logout();
    router.replace('/login');
  }, [logout]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={handleBack}
            disabled={isLoading}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Ionicons name="arrow-back" size={40} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Inscription</Text>

          <View style={styles.logoRow}>
            <MaterialCommunityIcons name="book-open-variant" size={54} color={GOLD} />
            <Text style={styles.brand}>EduAssist</Text>
          </View>

          <View style={styles.form}>
            {fields.map((field) => {
              const value = form[field.name];
              const isFocused = focusedField === field.name;
              const error = errors[field.name];
              const showError = Boolean(error) || (submitted && !value.trim());
              const isComplete = value.trim().length > 0 && !error;

              return (
                <View key={field.name}>
                  <View
                    style={[
                      styles.fieldShell,
                      isFocused && styles.focusedField,
                      showError && styles.errorField,
                    ]}
                  >
                    <View style={styles.inputTextBlock}>
                      <Text style={[styles.label, isFocused && styles.focusedLabel, showError && styles.errorLabel]}>
                        {field.label}
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder={field.placeholder}
                        placeholderTextColor={MUTED}
                        value={value}
                        onChangeText={(nextValue) => updateField(field.name, nextValue)}
                        onFocus={() => setFocusedField(field.name)}
                        onBlur={() => setFocusedField(null)}
                        keyboardType={field.keyboardType ?? 'default'}
                        editable={!isLoading}
                        autoCapitalize={field.name === 'telephone' ? 'none' : 'words'}
                      />
                    </View>

                    {isComplete && (
                      <Ionicons name="checkmark" size={34} color={GREEN} style={styles.checkIcon} />
                    )}
                  </View>

                  {showError && <Text style={styles.errorText}>{error || 'Erreur de saisie'}</Text>}
                </View>
              );
            })}

            <View style={styles.emailShell}>
              <Text style={styles.label}>Email Google</Text>
              <Text numberOfLines={1} style={styles.emailValue}>
                {state.user?.email || 'Compte Google connecte'}
              </Text>
              <Ionicons name="checkmark" size={34} color={GREEN} style={styles.checkIcon} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.86}
          >
            <LinearGradient
              colors={['#F7DA73', '#D4AF37', '#AA8C1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.submitText}>{isLoading ? 'Validation...' : 'Valider'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && <LoadingOverlay message="Creation du profil..." />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '400',
    textAlign: 'center',
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  brand: {
    color: GOLD,
    fontSize: 38,
    fontWeight: '500',
  },
  form: {
    gap: spacing.md,
  },
  fieldShell: {
    alignItems: 'center',
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingLeft: spacing.xl,
    paddingRight: spacing.lg,
  },
  focusedField: {
    borderColor: GOLD,
    borderWidth: 2,
  },
  errorField: {
    borderColor: RED,
    borderWidth: 2,
  },
  inputTextBlock: {
    flex: 1,
  },
  label: {
    color: MUTED,
    fontSize: 20,
    lineHeight: 24,
  },
  focusedLabel: {
    color: GOLD,
  },
  errorLabel: {
    color: RED,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    padding: 0,
  },
  checkIcon: {
    marginLeft: spacing.md,
  },
  errorText: {
    color: RED,
    fontSize: 22,
    fontWeight: '700',
    marginLeft: spacing.xl,
    marginTop: spacing.sm,
  },
  emailShell: {
    alignItems: 'center',
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingLeft: spacing.xl,
    paddingRight: spacing.lg,
  },
  emailValue: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 24,
    lineHeight: 30,
  },
  submitButton: {
    borderRadius: 34,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 78,
    paddingHorizontal: spacing.lg,
  },
  submitText: {
    color: BLACK,
    fontSize: 31,
    fontWeight: '800',
  },
});

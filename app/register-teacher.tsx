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
  ecole: '',
  classe: '',
  matiere: '',
};

type FieldName = keyof RegisterTeacherData;

const fields: Array<{
  name: FieldName;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
}> = [
    { name: 'nom', label: 'Nom', placeholder: 'Jean Dupont' },
    { name: 'prenom', label: 'Prenom', placeholder: 'Marc' },
    { name: 'telephone', label: 'Telephone', placeholder: '06 12 34 56 78', keyboardType: 'phone-pad' },
    { name: 'ecole', label: 'Ecole', placeholder: "Nom de l'etablissement" },
    { name: 'classe', label: 'Classe', placeholder: 'CM2' },
    { name: 'matiere', label: 'Matiere enseignee', placeholder: 'Mathematiques' },
  ];

const getFieldError = (name: FieldName, value: string): string | null => {
  const cleanValue = value.trim();

  if (!cleanValue) return null;
  if ((name === 'nom' || name === 'prenom' || name === 'ecole' || name === 'matiere') && cleanValue.length < 2) {
    return 'Erreur de saisie';
  }
  if (name === 'telephone' && !/^[0-9+\s]{8,}$/.test(cleanValue)) {
    return 'Erreur de saisie';
  }

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
    () =>
      fields.every((field) => form[field.name].trim().length > 0 && !errors[field.name]),
    [errors, form]
  );

  const updateField = useCallback((name: FieldName, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);

    if (!isValid) {
      Alert.alert('Formulaire incomplet', 'Veuillez verifier les informations saisies.');
      return;
    }

    try {
      await registerTeacher({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        telephone: form.telephone.trim(),
        ecole: form.ecole.trim(),
        classe: form.classe.trim(),
        matiere: form.matiere.trim(),
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  brand: {
    color: GOLD,
    fontSize: 28,
    fontWeight: '700',
  },
  form: {
    gap: spacing.md,
    width: '100%',
  },
  fieldShell: {
    alignItems: 'center',
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    width: '100%',
  },
  focusedField: {
    borderColor: GOLD,
    borderWidth: 1.5,
  },
  errorField: {
    borderColor: RED,
    borderWidth: 1.5,
  },
  inputTextBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  focusedLabel: {
    color: GOLD,
  },
  errorLabel: {
    color: RED,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 22,
    padding: 0,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  errorText: {
    color: RED,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: spacing.md,
    marginTop: 4,
  },
  emailShell: {
    alignItems: 'center',
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    width: '100%',
  },
  emailValue: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  submitButton: {
    borderRadius: 20,
    marginTop: spacing.xl,
    overflow: 'hidden',
    width: '100%',
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  submitText: {
    color: BLACK,
    fontSize: 18,
    fontWeight: '800',
  },
});

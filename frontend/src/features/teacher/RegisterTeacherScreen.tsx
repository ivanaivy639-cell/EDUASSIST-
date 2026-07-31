import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { registerTeacherSchema, type RegisterTeacherSchemaType } from '../../schemas/auth.schema';
import { AuthService } from '../../services/AuthService';
import { useAuth } from '../../hooks/useAuth';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { spacing } from '../../theme/spacing';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#242424';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const WHITE = '#FFFFFF';

export const RegisterTeacherScreen = React.memo(() => {
  const { refreshUser } = useAuth();
  const [focusedField, setFocusedField] = useState<'nom' | 'prenom' | 'telephone' | null>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterTeacherSchemaType>({
      resolver: zodResolver(registerTeacherSchema),
    });

  const onSubmit = async (data: RegisterTeacherSchemaType): Promise<void> => {
    try {
      const payload = {
        ...data,
        ecole: 'N/A',
        classe: 'N/A',
        matiere: 'N/A'
      };
      const response = await AuthService.registerTeacher(payload as any);
      if (response.success) {
        await refreshUser();
        Alert.alert('Succes', 'Profil enseignant cree avec succes !');
      }
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.logoBlock}>
          <MaterialCommunityIcons name="account-school-outline" size={48} color={GOLD} />
          <Text style={styles.title}>Completez votre profil</Text>
          <Text style={styles.subtitle}>Informations enseignant</Text>
        </View>

        <View style={styles.form}>
          {/* Nom */}
          <Controller
            control={control}
            name="nom"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={[styles.inputShell, focusedField === 'nom' && styles.focusedInput, errors.nom && styles.errorInput]}>
                  <Ionicons name="person-outline" size={22} color={focusedField === 'nom' ? GOLD : MUTED} />
                  <View style={styles.inputBlock}>
                    <Text style={[styles.inputLabel, focusedField === 'nom' && styles.focusedLabel]}>Nom *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Votre nom"
                      placeholderTextColor={MUTED}
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocusedField('nom')}
                      onBlur={() => {
                        setFocusedField(null);
                        onBlur();
                      }}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
                {errors.nom && <Text style={styles.errorText}>{errors.nom.message}</Text>}
              </View>
            )}
          />

          {/* Prenom */}
          <Controller
            control={control}
            name="prenom"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={[styles.inputShell, focusedField === 'prenom' && styles.focusedInput, errors.prenom && styles.errorInput]}>
                  <Ionicons name="person-outline" size={22} color={focusedField === 'prenom' ? GOLD : MUTED} />
                  <View style={styles.inputBlock}>
                    <Text style={[styles.inputLabel, focusedField === 'prenom' && styles.focusedLabel]}>Prenom *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Votre prenom"
                      placeholderTextColor={MUTED}
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocusedField('prenom')}
                      onBlur={() => {
                        setFocusedField(null);
                        onBlur();
                      }}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
                {errors.prenom && <Text style={styles.errorText}>{errors.prenom.message}</Text>}
              </View>
            )}
          />

          {/* Telephone */}
          <Controller
            control={control}
            name="telephone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={[styles.inputShell, focusedField === 'telephone' && styles.focusedInput, errors.telephone && styles.errorInput]}>
                  <Ionicons name="call-outline" size={22} color={focusedField === 'telephone' ? GOLD : MUTED} />
                  <View style={styles.inputBlock}>
                    <Text style={[styles.inputLabel, focusedField === 'telephone' && styles.focusedLabel]}>Telephone *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="6XX XXX XXX"
                      placeholderTextColor={MUTED}
                      keyboardType="phone-pad"
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocusedField('telephone')}
                      onBlur={() => {
                        setFocusedField(null);
                        onBlur();
                      }}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
                {errors.telephone && <Text style={styles.errorText}>{errors.telephone.message}</Text>}
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E5C563', '#D4AF37', '#B6922A']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.createButtonText}>Creer mon profil</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {isSubmitting && <LoadingOverlay message="Creation du profil..." />}
    </SafeAreaView>
  );
});

RegisterTeacherScreen.displayName = 'RegisterTeacherScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: 60,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: WHITE,
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: MUTED,
    fontSize: 16,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FIELD,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  focusedInput: {
    borderColor: GOLD,
    backgroundColor: '#2A2A2A',
  },
  errorInput: {
    borderColor: '#FF4B4B',
  },
  inputBlock: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  inputLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  focusedLabel: {
    color: GOLD,
  },
  input: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
    padding: 0,
    height: 24,
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  createButton: {
    borderRadius: 34,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: spacing.lg,
  },
  createButtonText: {
    color: BLACK,
    fontSize: 18,
    fontWeight: '800',
  },
});

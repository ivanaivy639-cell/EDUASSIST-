import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerTeacherSchema, type RegisterTeacherSchemaType } from '../../schemas/auth.schema';
import { AuthService } from '../../services/AuthService';
import { useAuth } from '../../hooks/useAuth';
import { AppInput } from '../../components/forms/AppInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const RegisterTeacherScreen = React.memo((): JSX.Element => {
  const { refreshUser } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = 
    useForm<RegisterTeacherSchemaType>({
      resolver: zodResolver(registerTeacherSchema),
    });

  const onSubmit = async (data: RegisterTeacherSchemaType): Promise<void> => {
    try {
      const response = await AuthService.registerTeacher(data);
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Completez votre profil</Text>
        <Text style={styles.subtitle}>Informations enseignant</Text>

        <View style={styles.form}>
          <AppInput name="nom" control={control} label="Nom" placeholder="Votre nom" error={errors.nom?.message} />
          <AppInput name="prenom" control={control} label="Prenom" placeholder="Votre prenom" error={errors.prenom?.message} />
          <AppInput name="telephone" control={control} label="Telephone" placeholder="6XX XXX XXX" keyboardType="phone-pad" error={errors.telephone?.message} />
          <AppInput name="ecole" control={control} label="Ecole" placeholder="Nom de votre ecole" error={errors.ecole?.message} />
          <AppInput name="classe" control={control} label="Classe principale" placeholder="Ex: Terminale C" error={errors.classe?.message} />
          <AppInput name="matiere" control={control} label="Matiere principale" placeholder="Ex: Mathematiques" error={errors.matiere?.message} />

          <PrimaryButton title="Creer mon profil" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>
      </ScrollView>

      {isSubmitting && <LoadingOverlay message="Creation du profil..." />}
    </SafeAreaView>
  );
});

RegisterTeacherScreen.displayName = 'RegisterTeacherScreen';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl },
  title: { fontSize: typography.size.title, fontWeight: typography.weight.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.size.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { gap: spacing.md },
});

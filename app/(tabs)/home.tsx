import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';

import { useAuth } from '@/src/hooks/useAuth';
import { spacing } from '@/src/theme/spacing';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#242424';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const WHITE = '#FFFFFF';

export default function HomeScreen() {
  const { state, logout } = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert('Deconnexion', 'Voulez-vous fermer votre session ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se deconnecter',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }, [logout]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <MaterialCommunityIcons name="book-open-variant" size={38} color={GOLD} />
            <Text style={styles.brand}>EduAssist</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Se deconnecter"
          >
            <Ionicons name="log-out-outline" size={24} color={WHITE} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Bonjour, {state.user?.name || 'Enseignant'}</Text>
        <Text style={styles.subtitle}>Votre espace pedagogique est pret.</Text>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => router.push('/ai' as Href)}
          activeOpacity={0.86}
        >
          <LinearGradient
            colors={['#F7DA73', '#D4AF37', '#AA8C1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Ionicons name="sparkles-outline" size={24} color={BLACK} />
            <Text style={styles.aiButtonText}>Ouvrir le module IA</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={24} color={GOLD} />
            <Text style={styles.infoTitle}>Compte Google</Text>
            <Text numberOfLines={1} style={styles.infoValue}>{state.user?.email}</Text>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="school-outline" size={24} color={GOLD} />
            <Text style={styles.infoTitle}>Profil enseignant</Text>
            <Text style={styles.infoValue}>Valide</Text>
          </View>
        </View>

        <View style={styles.moduleBox}>
          <View style={styles.moduleHeader}>
            <Ionicons name="bulb-outline" size={24} color={GOLD} />
            <Text style={styles.moduleTitle}>Assistant IA</Text>
          </View>
          <Text style={styles.moduleText}>
            Generez des fiches, exercices, quiz et resumes adaptes a votre classe, puis ajustez-les selon votre contexte.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  brand: {
    color: GOLD,
    fontSize: 28,
    fontWeight: '600',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    color: WHITE,
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44,
  },
  subtitle: {
    color: MUTED,
    fontSize: 17,
    marginTop: spacing.sm,
  },
  aiButton: {
    borderRadius: 34,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  gradientButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: spacing.lg,
  },
  aiButtonText: {
    color: BLACK,
    fontSize: 22,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  infoBox: {
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    minHeight: 122,
    padding: spacing.lg,
  },
  infoTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  infoValue: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  moduleBox: {
    backgroundColor: '#111111',
    borderColor: FIELD_BORDER,
    borderRadius: 28,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  moduleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  moduleTitle: {
    color: WHITE,
    fontSize: 21,
    fontWeight: '800',
  },
  moduleText: {
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
  },
});

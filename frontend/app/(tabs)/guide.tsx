import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/src/theme/spacing';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#141414';
const FIELD_BORDER = '#2A2A2A';
const MUTED = '#8F8F8F';
const WHITE = '#FFFFFF';

export default function GuideScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Le Guide</Text>
        <Text style={styles.headerSubtitle}>Comment utiliser EduAssist</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="home" size={24} color={GOLD} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Tableau de bord</Text>
          </View>
          <Text style={styles.sectionText}>
            L'accueil regroupe toutes vos classes. Vous pouvez ajouter une nouvelle classe en appuyant sur le bouton "+" en haut à droite. Chaque classe contiendra vos cours et vos élèves.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color={GOLD} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Gestion des Cours</Text>
          </View>
          <Text style={styles.sectionText}>
            Dans une classe, vous pouvez créer des cours. Chaque cours est organisé en "Chapitres", puis en "Leçons". Vous pouvez générer le contenu d'un cours automatiquement grâce à l'Intelligence Artificielle en utilisant le bouton de génération.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles" size={24} color={GOLD} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Assistant Pédagogique</Text>
          </View>
          <Text style={styles.sectionText}>
            Lors de la consultation d'un cours ou d'une leçon, l'Assistant IA est à votre disposition dans le panneau latéral. Vous pouvez lui demander de détailler un point, d'expliquer un concept complexe, ou même de générer une illustration pour votre leçon.
          </Text>
        </View>

        <View style={styles.tipBox}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color={BLACK} />
            <Text style={styles.tipTitle}>Astuce Pro</Text>
          </View>
          <Text style={styles.tipText}>
            N'hésitez pas à télécharger des documents (PDF) dans le panneau de l'Assistant IA. L'assistant lira le document et pourra en extraire les informations clés pour vous aider à préparer votre cours plus rapidement !
          </Text>
        </View>

        <View style={styles.tipBox}>
          <View style={styles.tipHeader}>
            <Ionicons name="settings" size={20} color={BLACK} />
            <Text style={styles.tipTitle}>Personnalisation</Text>
          </View>
          <Text style={styles.tipText}>
            Vous pouvez modifier le modèle d'Intelligence Artificielle utilisé depuis les paramètres (si votre abonnement le permet) pour obtenir des réponses plus rapides ou plus détaillées.
          </Text>
        </View>

        <View style={{ height: 40 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: FIELD_BORDER,
    backgroundColor: BLACK,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: GOLD,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: MUTED,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: FIELD,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: WHITE,
  },
  sectionText: {
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 22,
  },
  tipBox: {
    backgroundColor: GOLD,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BLACK,
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: BLACK,
    lineHeight: 20,
    opacity: 0.9,
  },
});

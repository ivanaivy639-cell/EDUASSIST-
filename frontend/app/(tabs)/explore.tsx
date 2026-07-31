import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const MUTED = '#A9A9A9';
const WHITE = '#FFFFFF';
const FIELD = '#141414';

export default function GuideScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Guide d'utilisation</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="home" size={24} color={GOLD} />
            <Text style={styles.cardTitle}>1. Le Dashboard (Accueil)</Text>
          </View>
          <Text style={styles.cardText}>
            C'est ici que vous gérez vos classes. Vous pouvez ajouter une classe (ex: "6ème A"), puis y ajouter des chapitres. Dans chaque chapitre, vous créez vos leçons.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={24} color={GOLD} />
            <Text style={styles.cardTitle}>2. Générer un cours (Dans l'Accueil)</Text>
          </View>
          <Text style={styles.cardText}>
            Pour générer un cours ou des exercices qui s'enregistrent dans votre arborescence, allez dans Accueil {' > '} Votre Classe {' > '} Votre Chapitre, puis cliquez sur le bouton "Générer une leçon assistée". L'assistant créera le document et l'ouvrira dans l'Éditeur.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={24} color={GOLD} />
            <Text style={styles.cardTitle}>3. Éditeur : Mode Élève et Prof</Text>
          </View>
          <Text style={styles.cardText}>
            Dans l'éditeur, utilisez les boutons "Élèves (Sans corrigé)" et "Prof (Avec corrigé)". En mode Élève, les réponses sont automatiquement masquées, idéal pour imprimer ou générer un PDF vierge pour vos élèves.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubbles-outline" size={24} color={GOLD} />
            <Text style={styles.cardTitle}>4. Le Chat (Onglet Assistant)</Text>
          </View>
          <Text style={styles.cardText}>
            L'onglet "Assistant" en bas de l'écran est un espace de discussion libre. Utilisez-le pour poser des questions rapides, brainstormer, ou corriger un texte. Attention, les documents générés ici ne sont pas rangés automatiquement dans vos classes.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={24} color={GOLD} />
            <Text style={styles.cardTitle}>5. Exporter en PDF ou Word</Text>
          </View>
          <Text style={styles.cardText}>
            Cliquez sur les boutons PDF ou Word dans l'éditeur ou dans le chat pour télécharger le document. Il sera automatiquement sauvegardé dans la rubrique "Documents" de votre compte.
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
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: FIELD,
  },
  headerTitle: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: GOLD,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: FIELD,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: WHITE,
    marginLeft: spacing.sm,
  },
  cardText: {
    fontSize: typography.size.body,
    color: MUTED,
    lineHeight: 22,
  },
});
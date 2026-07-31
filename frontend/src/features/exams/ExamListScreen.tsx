import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ExamService } from '../../services/ExamService';
import type { Exam } from '../../types/exam.types';

// ─── Design Tokens ───────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_DIM = 'rgba(212,175,55,0.12)';
const DARK = '#0A0A0A';
const CARD = '#111111';
const FIELD = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#8A8A8A';
const WHITE = '#FFFFFF';
const GREEN = '#38A169';
const RED = '#E53E3E';
const ORANGE = '#DD6B20';

// ─── Status Config ───────────────────────────────────────
const STATUS_CONFIG = {
  active: { label: 'Actif', color: GREEN, icon: 'radio-button-on' as const },
  inactive: { label: 'Fermé', color: RED, icon: 'radio-button-off' as const },
};

export const ExamListScreen = React.memo(() => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExams = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await ExamService.list();
      if (res.success) {
        setExams(res.data);
      }
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadExams(true);
  }, [loadExams]);

  const handleCopyLink = async (url: string) => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for native - use expo-clipboard if available
        try {
          const Clipboard = require('expo-clipboard');
          await Clipboard.setStringAsync(url);
        } catch {
          // If expo-clipboard not available, show the URL
          Alert.alert('Lien', url);
          return;
        }
      }
      Alert.alert('✅ Copié !', 'Le lien de l\'examen a été copié dans le presse-papiers.');
    } catch {
      Alert.alert('Erreur', 'Impossible de copier le lien.');
    }
  };

  const handleToggleActive = async (exam: Exam) => {
    try {
      await ExamService.toggleActive(exam.id, !exam.is_active);
      loadExams(true);
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier le statut.');
    }
  };

  const handleDelete = (exam: Exam) => {
    Alert.alert(
      'Supprimer l\'examen',
      `Êtes-vous sûr de vouloir supprimer "${exam.title}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await ExamService.delete(exam.id);
              loadExams(true);
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer l\'examen.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderExamCard = ({ item: exam }: { item: Exam }) => {
    const status = exam.is_active ? STATUS_CONFIG.active : STATUS_CONFIG.inactive;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/exam/${exam.id}` as any)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>{exam.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
              <Ionicons name={status.icon} size={10} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.cardDate}>{formatDate(exam.created_at)}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={MUTED} />
            <Text style={styles.statValue}>{exam.duration_minutes} min</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color={MUTED} />
            <Text style={styles.statValue}>{exam.submissions_count} copies</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-done-outline" size={16} color={MUTED} />
            <Text style={styles.statValue}>{exam.graded_count} corrigées</Text>
          </View>
          {exam.average_score !== null && (
            <View style={styles.statItem}>
              <Ionicons name="stats-chart-outline" size={16} color={GOLD} />
              <Text style={[styles.statValue, { color: GOLD }]}>
                Moy: {exam.average_score}/{exam.max_score}
              </Text>
            </View>
          )}
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleCopyLink(exam.public_url)}
          >
            <Ionicons name="copy-outline" size={16} color={GOLD} />
            <Text style={styles.actionText}>Copier le lien</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleToggleActive(exam)}
          >
            <Ionicons
              name={exam.is_active ? 'pause-circle-outline' : 'play-circle-outline'}
              size={16}
              color={exam.is_active ? ORANGE : GREEN}
            />
            <Text style={[styles.actionText, { color: exam.is_active ? ORANGE : GREEN }]}>
              {exam.is_active ? 'Fermer' : 'Ouvrir'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDelete(exam)}
          >
            <Ionicons name="trash-outline" size={16} color={RED} />
            <Text style={[styles.actionText, { color: RED }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={{ fontSize: 48 }}>📝</Text>
      </View>
      <Text style={styles.emptyTitle}>Aucune évaluation</Text>
      <Text style={styles.emptySubtitle}>
        Créez votre première évaluation à distance.{'\n'}
        Générez l'épreuve depuis une leçon puis partagez le lien avec vos étudiants.
      </Text>
      <TouchableOpacity
        style={styles.createBtnEmpty}
        onPress={() => router.push('/exam/create' as any)}
      >
        <Ionicons name="add-circle" size={20} color="#000" />
        <Text style={styles.createBtnEmptyText}>Créer une évaluation</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📝 Évaluations</Text>
          <Text style={styles.headerSubtitle}>
            {exams.length} évaluation{exams.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/exam/create' as any)}
        >
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.createBtnText}>Créer</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Chargement des évaluations...</Text>
        </View>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExamCard}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={GOLD}
              colors={[GOLD]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DARK,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: WHITE,
  },
  headerSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: MUTED,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDate: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: GOLD,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GOLD_DIM,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  createBtnEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GOLD,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createBtnEmptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});

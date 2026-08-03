import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { ExamService } from '../../services/ExamService';
import type { ExamSubmission, ExamResultsStats, ExamDetail } from '../../types/exam.types';

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
const BLUE = '#4299E1';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  graded:       { label: 'Corrigé',       color: GREEN,  icon: '✅' },
  submitted:    { label: 'En correction', color: BLUE,   icon: '📝' },
  in_progress:  { label: 'En cours',     color: ORANGE, icon: '⏳' },
  expired:      { label: 'Expiré',       color: MUTED,  icon: '⏰' },
  disqualified: { label: 'Disqualifié',  color: RED,    icon: '🚫' },
};

export const ExamResultsScreen = React.memo(() => {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [stats, setStats] = useState<ExamResultsStats | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadResults = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await ExamService.getResults(parseInt(examId, 10));
      if (res.success) {
        setExam(res.data.exam as any);
        setSubmissions(res.data.submissions);
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
      Alert.alert('Erreur', 'Impossible de charger les résultats.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleCopyLink = async () => {
    if (!exam) return;
    try {
      const url = `${Platform.OS === 'web' ? window.location.origin : ''}/exam/${(exam as any).token}`;
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(url);
      } else {
        await Clipboard.setStringAsync(url);
      }
      Alert.alert('✅ Copié !', 'Le lien a été copié.');
    } catch {
      // Silent fail
    }
  };

  const getScoreColor = (score: number | null, maxScore: number) => {
    if (score === null) return MUTED;
    const pct = score / maxScore;
    if (pct >= 0.7) return GREEN;
    if (pct >= 0.5) return ORANGE;
    return RED;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStatsSection = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>📊 Statistiques</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Copies</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.graded}</Text>
            <Text style={styles.statLabel}>Corrigées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: GOLD }]}>
              {stats.average !== null ? stats.average.toFixed(1) : '—'}
            </Text>
            <Text style={styles.statLabel}>Moyenne</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: BLUE }]}>
              {stats.median !== null ? stats.median.toFixed(1) : '—'}
            </Text>
            <Text style={styles.statLabel}>Médiane</Text>
          </View>
        </View>

        <View style={styles.statsRow2}>
          <View style={styles.statsRow2Item}>
            <Ionicons name="arrow-up" size={14} color={GREEN} />
            <Text style={[styles.statsRow2Value, { color: GREEN }]}>
              {stats.max_achieved ?? '—'}
            </Text>
            <Text style={styles.statsRow2Label}>Max</Text>
          </View>
          <View style={styles.statsRow2Item}>
            <Ionicons name="arrow-down" size={14} color={RED} />
            <Text style={[styles.statsRow2Value, { color: RED }]}>
              {stats.min_achieved ?? '—'}
            </Text>
            <Text style={styles.statsRow2Label}>Min</Text>
          </View>
          <View style={styles.statsRow2Item}>
            <Ionicons name="checkmark-circle" size={14} color={GREEN} />
            <Text style={[styles.statsRow2Value, { color: GREEN }]}>
              {stats.pass_rate !== null ? `${stats.pass_rate}%` : '—'}
            </Text>
            <Text style={styles.statsRow2Label}>Réussite</Text>
          </View>
          <View style={styles.statsRow2Item}>
            <Ionicons name="warning" size={14} color={RED} />
            <Text style={[styles.statsRow2Value, { color: RED }]}>
              {stats.disqualified}
            </Text>
            <Text style={styles.statsRow2Label}>Disqualif.</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSubmissionCard = ({ item: sub }: { item: ExamSubmission }) => {
    const statusConf = STATUS_LABELS[sub.status] || STATUS_LABELS.submitted;
    const isExpanded = expandedId === sub.id;

    return (
      <TouchableOpacity
        style={styles.subCard}
        activeOpacity={0.7}
        onPress={() => setExpandedId(isExpanded ? null : sub.id)}
      >
        {/* Header Row */}
        <View style={styles.subHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subName}>{sub.student_name}</Text>
            <Text style={styles.subMatricule}>{sub.student_matricule}</Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {sub.score !== null ? (
              <Text style={[
                styles.subScore,
                { color: getScoreColor(sub.score, sub.max_score) },
              ]}>
                {sub.score}/{sub.max_score}
              </Text>
            ) : (
              <Text style={[styles.subScore, { color: MUTED }]}>—</Text>
            )}
            <View style={[styles.subStatusBadge, { backgroundColor: `${statusConf.color}15` }]}>
              <Text style={{ fontSize: 10 }}>{statusConf.icon}</Text>
              <Text style={[styles.subStatusText, { color: statusConf.color }]}>
                {statusConf.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Meta Row */}
        <View style={styles.subMeta}>
          <Text style={styles.subMetaText}>
            🕐 {formatDate(sub.submitted_at || sub.started_at)}
          </Text>
          {sub.tab_switches > 0 && (
            <Text style={[styles.subMetaText, { color: sub.tab_switches > 2 ? RED : ORANGE }]}>
              ⚠️ {sub.tab_switches} sortie{sub.tab_switches > 1 ? 's' : ''}
            </Text>
          )}
          {sub.is_auto_submitted && (
            <Text style={[styles.subMetaText, { color: ORANGE }]}>🔄 Auto</Text>
          )}
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {sub.answers && (
              <View style={styles.expandedSection}>
                <Text style={styles.expandedLabel}>📝 Réponses de l'étudiant</Text>
                <View style={styles.expandedBox}>
                  <Text style={styles.expandedText} selectable>{sub.answers}</Text>
                </View>
              </View>
            )}

            {sub.ai_feedback && (
              <View style={styles.expandedSection}>
                <Text style={styles.expandedLabel}>✅ Correction Automatique</Text>
                <View style={[styles.expandedBox, { borderColor: 'rgba(212,175,55,0.2)' }]}>
                  <Text style={styles.expandedText} selectable>{sub.ai_feedback}</Text>
                </View>
              </View>
            )}

            {!sub.answers && !sub.ai_feedback && (
              <Text style={styles.expandedEmpty}>
                Aucun détail disponible pour cette soumission.
              </Text>
            )}
          </View>
        )}

        {/* Expand indicator */}
        <View style={styles.expandIndicator}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={MUTED}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Chargement des résultats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={WHITE} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {exam?.title || 'Résultats'}
          </Text>
          {exam?.classe ? (
            <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 2, marginBottom: 2 }}>
              <Text style={{ color: GOLD, fontSize: 11, fontWeight: '700' }}>🏫 {exam.classe}</Text>
            </View>
          ) : null}
          <Text style={styles.headerSubtitle}>
            {submissions.length} copie{submissions.length !== 1 ? 's' : ''} • /{exam?.max_score || 20}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadResults}>
          <Ionicons name="refresh" size={20} color={GOLD} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={submissions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSubmissionCard}
        ListHeaderComponent={renderStatsSection}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={styles.emptyTitle}>Aucune copie reçue</Text>
            <Text style={styles.emptySubtitle}>
              Les copies apparaîtront ici dès que les étudiants auront composé.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: FIELD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  headerSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: GOLD_DIM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
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

  // Stats
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 14,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
  },
  statsRow2: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
  },
  statsRow2Item: {
    alignItems: 'center',
    gap: 4,
  },
  statsRow2Value: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
  },
  statsRow2Label: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '600',
  },

  // Submission Card
  subCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subName: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
  },
  subMatricule: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '500',
    marginTop: 2,
  },
  subScore: {
    fontSize: 20,
    fontWeight: '800',
  },
  subStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subStatusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subMeta: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  subMetaText: {
    fontSize: 11,
    color: MUTED,
  },

  // Expanded
  expandedContent: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  expandedSection: {
    marginBottom: 14,
  },
  expandedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: GOLD,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expandedBox: {
    backgroundColor: FIELD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 14,
    maxHeight: 300,
  },
  expandedText: {
    fontSize: 13,
    color: '#D0D0D0',
    lineHeight: 20,
  },
  expandedEmpty: {
    fontSize: 13,
    color: MUTED,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  expandIndicator: {
    alignItems: 'center',
    paddingTop: 8,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
});

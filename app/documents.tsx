import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { spacing } from '@/src/theme/spacing';
import { apiClient } from '@/src/services/ApiClient';
import { API_CONFIG } from '@/src/config/api.config';
import { ClassService } from '@/src/services/ClassService';
import type { TeacherClass } from '@/src/types/class.types';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#1A1A1A';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const WHITE = '#FFFFFF';

interface DocumentItem {
  id: string;
  title: string;
  format: 'pdf' | 'docx';
  class_id?: number | null;
  class_name?: string;
  url: string;
  created_at: string;
}

export default function DocumentsScreen() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | 'all'>('all');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [docsRes, classesRes] = await Promise.all([
          apiClient.get('/documents').catch(() => null),
          ClassService.getClasses().catch(() => null),
        ]);

        if (active) {
          if (docsRes?.data?.success && Array.isArray(docsRes.data.data)) {
            setDocuments(docsRes.data.data);
          } else {
            setDocuments([]);
          }

          if (classesRes?.success && Array.isArray(classesRes.data)) {
            setClasses(classesRes.data);
          }
        }
      } catch (error) {
        console.error('Error loading documents screen data:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    if (selectedClassId === 'all') return documents;
    return documents.filter(
      (doc) => doc.class_id === selectedClassId || doc.class_name === classes.find(c => c.id === selectedClassId)?.name
    );
  }, [documents, selectedClassId, classes]);

  const handleDownload = async (doc: DocumentItem) => {
    let downloadUrl = doc.url;
    if (Platform.OS !== 'web') {
      const apiOrigin = API_CONFIG.BASE_URL.split('/api')[0];
      downloadUrl = downloadUrl.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, apiOrigin);
    }

    if (Platform.OS === 'web') {
      window.open(downloadUrl, '_blank');
    } else {
      try {
        const extension = doc.format === 'pdf' ? 'pdf' : 'docx';
        const fileUri = (FileSystem as any).documentDirectory + `document_${Date.now()}.${extension}`;
        const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert('Succès', 'Document téléchargé, mais le partage n\'est pas disponible.');
        }
      } catch (error) {
        console.error('Download error:', error);
        Alert.alert('Erreur', 'Impossible de télécharger le document.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bibliothèque de Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Répertoire complet des fiches, cours et épreuves téléchargés sur la plateforme, classés par classe.
        </Text>

        {/* Horizontal Class Filters */}
        <Text style={styles.filterTitle}>Filtrer par classe :</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedClassId === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedClassId('all')}
          >
            <Text style={[styles.filterText, selectedClassId === 'all' && styles.filterTextActive]}>
              Toutes ({documents.length})
            </Text>
          </TouchableOpacity>

          {classes.map((cls) => {
            const classDocCount = documents.filter(
              d => d.class_id === cls.id || d.class_name === cls.name
            ).length;

            return (
              <TouchableOpacity
                key={cls.id}
                style={[styles.filterChip, selectedClassId === cls.id && styles.filterChipActive]}
                onPress={() => setSelectedClassId(cls.id)}
              >
                <Text style={[styles.filterText, selectedClassId === cls.id && styles.filterTextActive]}>
                  {cls.name} ({classDocCount})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={GOLD} style={{ marginTop: 40 }} />
        ) : filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={FIELD_BORDER} />
            <Text style={styles.emptyTitle}>Aucun document trouvé</Text>
            <Text style={styles.emptyText}>
              {selectedClassId === 'all'
                ? "Vous n'avez pas encore généré ou téléchargé de documents."
                : "Aucun document n'a été créé pour cette classe."}
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={() => router.back()}>
              <Text style={styles.createButtonText}>Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredDocuments.map((doc) => (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docIcon}>
                  <MaterialCommunityIcons 
                    name={doc.format === 'pdf' ? 'file-pdf-box' : 'file-word-box'} 
                    size={36} 
                    color={doc.format === 'pdf' ? '#FF4B4B' : '#4B96FF'} 
                  />
                </View>

                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.classBadge}>
                      <Text style={styles.classBadgeText}>{doc.class_name || 'Général'}</Text>
                    </View>
                    <Text style={styles.docDate}>
                      {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.downloadBtn}
                  onPress={() => handleDownload(doc)}
                  accessibilityLabel="Télécharger le document"
                >
                  <Ionicons name="download-outline" size={22} color={GOLD} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: FIELD_BORDER,
    backgroundColor: BLACK,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  description: {
    color: MUTED,
    fontSize: 14,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  filterTitle: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  filterScroll: {
    marginBottom: spacing.xl,
  },
  filterContainer: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterChip: {
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  filterText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: BLACK,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: spacing.md,
  },
  emptyText: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: '80%',
    lineHeight: 20,
  },
  createButton: {
    marginTop: spacing.xl,
    backgroundColor: GOLD,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: BLACK,
    fontWeight: 'bold',
    fontSize: 16,
  },
  grid: {
    gap: spacing.md,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FIELD,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  docIcon: {
    marginRight: spacing.md,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  classBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: GOLD,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  classBadgeText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '700',
  },
  docDate: {
    color: MUTED,
    fontSize: 12,
  },
  downloadBtn: {
    padding: spacing.md,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
});

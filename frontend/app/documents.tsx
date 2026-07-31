import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { spacing } from '@/src/theme/spacing';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const WHITE = '#FFFFFF';
import { apiClient } from '@/src/services/ApiClient';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_CONFIG } from '@/src/config/api.config';

export default function DocumentsScreen() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await apiClient.get('/documents');
        if (response.data?.success) {
          setDocuments(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Retrouvez ici uniquement l'ensemble des documents générés et téléchargés via l'Assistant.
        </Text>

        {loading ? (
          <ActivityIndicator color={GOLD} style={{ marginTop: 40 }} />
        ) : documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={FIELD_BORDER} />
            <Text style={styles.emptyTitle}>Aucun document</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore généré ou téléchargé de documents.
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={() => router.back()}>
              <Text style={styles.createButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {documents.map((doc, index) => (
              <View key={index} style={styles.docCard}>
                <View style={styles.docIcon}>
                  <MaterialCommunityIcons 
                    name={doc.format === 'pdf' ? 'file-pdf-box' : 'file-word-box'} 
                    size={32} 
                    color={doc.format === 'pdf' ? '#FF4B4B' : '#4B96FF'} 
                  />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docDate}>{new Date(doc.created_at).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.downloadBtn}
                  onPress={async () => {
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
                  }}
                >
                  <Ionicons name="download-outline" size={20} color={GOLD} />
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
    padding: spacing.xl,
    paddingBottom: 100,
  },
  description: {
    color: MUTED,
    fontSize: 14,
    marginBottom: spacing.xl,
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
  },
  createButton: {
    marginTop: spacing.xl,
    backgroundColor: GOLD,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: 8,
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
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  docDate: {
    color: MUTED,
    fontSize: 12,
  },
  downloadBtn: {
    padding: spacing.sm,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
  }
});

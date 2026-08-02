import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href, Link } from 'expo-router';

import { useAuth } from '@/src/hooks/useAuth';
import { spacing } from '@/src/theme/spacing';
import { ClassService } from '@/src/services/ClassService';
import { apiClient } from '@/src/services/ApiClient';
import type { TeacherClass } from '@/src/types/class.types';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#242424';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const WHITE = '#FFFFFF';

export default function HomeScreen() {
  const { state, logout } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [examsCount, setExamsCount] = useState<number>(0);
  const [documentsCount, setDocumentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAddClassVisible, setAddClassVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [classesRes, examsRes, docsRes] = await Promise.all([
        ClassService.getClasses().catch(() => null),
        apiClient.get('/exams').catch(() => null),
        apiClient.get('/documents').catch(() => null),
      ]);

      if (classesRes?.success && Array.isArray(classesRes.data)) {
        setClasses(classesRes.data);
      }
      if (examsRes?.data?.success && Array.isArray(examsRes.data.data)) {
        setExamsCount(examsRes.data.data.length);
      }
      if (docsRes?.data?.success && Array.isArray(docsRes.data.data)) {
        setDocumentsCount(docsRes.data.data.length);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totalCourses = useMemo(() => {
    return classes.reduce((sum, cls) => sum + (cls.courses?.length || 0), 0);
  }, [classes]);

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    setIsAdding(true);
    try {
      await ClassService.createClass(newClassName.trim(), newClassLevel.trim() || undefined);
      setAddClassVisible(false);
      setNewClassName('');
      setNewClassLevel('');
      void loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la classe.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleLogout = useCallback(() => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Voulez-vous fermer votre session ?');
      if (confirmLogout) {
        logout().then(() => router.replace('/login'));
      }
    } else {
      Alert.alert('Déconnexion', 'Voulez-vous fermer votre session ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]);
    }
  }, [logout]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Curve Style */}
        <View style={styles.headerBackground}>
          <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
            <View style={styles.headerTop}>
              <View style={styles.brandRow}>
                <MaterialCommunityIcons name="book-open-variant" size={24} color={GOLD} />
                <Text style={styles.brand}>EduAssist</Text>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={24} color={WHITE} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.profileRow}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color={MUTED} />
              </View>
              <View>
                <Text style={styles.profileRole}>Enseignant</Text>
                <Text style={styles.profileName}>{state.user?.name || 'Professeur'}</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Real Dynamic Stats Horizontal Scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.statsScroll}
          contentContainerStyle={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <MaterialCommunityIcons name="google-classroom" size={20} color={GOLD} />
            </View>
            <Text style={styles.statTitle}>Classes</Text>
            <Text style={styles.statValue}>{classes.length}</Text>
            <Text style={styles.statSub}>Gérées</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="book-outline" size={20} color={GOLD} />
            </View>
            <Text style={styles.statTitle}>Cours</Text>
            <Text style={styles.statValue}>{totalCourses}</Text>
            <Text style={styles.statSub}>Enregistrés</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="school-outline" size={20} color={GOLD} />
            </View>
            <Text style={styles.statTitle}>Évaluations</Text>
            <Text style={styles.statValue}>{examsCount}</Text>
            <Text style={styles.statSub}>Créées</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="document-text-outline" size={20} color={GOLD} />
            </View>
            <Text style={styles.statTitle}>Documents</Text>
            <Text style={styles.statValue}>{documentsCount}</Text>
            <Text style={styles.statSub}>Disponibles</Text>
          </View>
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.quickActionsGrid}>
            <Link href="/assistant" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient colors={['#F7DA73', '#D4AF37']} style={styles.actionIconBox}>
                  <Ionicons name="sparkles" size={28} color={BLACK} />
                </LinearGradient>
                <Text style={styles.actionText}>L'Assistant</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/documents" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIconBoxSecondary}>
                  <Ionicons name="folder-open-outline" size={28} color={GOLD} />
                </View>
                <Text style={styles.actionText}>Documents</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(tabs)/exams" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIconBoxSecondary}>
                  <Ionicons name="school-outline" size={28} color={GOLD} />
                </View>
                <Text style={styles.actionText}>Évaluations</Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity style={styles.actionButton} onPress={() => setAddClassVisible(true)}>
              <View style={styles.actionIconBoxSecondary}>
                <Ionicons name="add-circle-outline" size={28} color={GOLD} />
              </View>
              <Text style={styles.actionText}>+ Classe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mes Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Mes Classes</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setAddClassVisible(true)}>
              <Ionicons name="add" size={20} color={BLACK} />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator color={GOLD} style={{ marginTop: spacing.md }} />
          ) : classes.length === 0 ? (
            <Text style={{ color: MUTED }}>Aucune classe trouvée.</Text>
          ) : (
            classes.map((cls) => (
              <TouchableOpacity 
                key={cls.id} 
                style={styles.docCard}
                onPress={() => router.push(`/class/${cls.id}` as Href)}
              >
                <View style={styles.docIconPDF}>
                  <MaterialCommunityIcons name="google-classroom" size={24} color={GOLD} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{cls.name}</Text>
                  <Text style={styles.docClass}>{cls.courses?.length || 0} cours</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={MUTED} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={isAddClassVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle Classe</Text>
            <TextInput
              style={[styles.modalInput, { marginBottom: spacing.md }]}
              placeholder="Nom de la classe (ex: Terminale S)"
              placeholderTextColor={MUTED}
              value={newClassName}
              onChangeText={setNewClassName}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Niveau (ex: Lycée, 3ème, etc.)"
              placeholderTextColor={MUTED}
              value={newClassLevel}
              onChangeText={setNewClassLevel}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAddClassVisible(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddClass} disabled={isAdding}>
                {isAdding ? (
                  <ActivityIndicator color={BLACK} size="small" />
                ) : (
                  <Text style={styles.modalAddText}>Créer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 100,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  headerBackground: {
    backgroundColor: FIELD,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderTopWidth: 0,
  },
  headerSafeArea: {
    paddingTop: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  brand: {
    color: GOLD,
    fontSize: 20,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBtn: {
    position: 'relative',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GOLD,
  },
  profileRole: {
    color: MUTED,
    fontSize: 13,
  },
  profileName: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  statsScroll: {
    marginTop: -24,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  statCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: spacing.md,
    minWidth: 120,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statTitle: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '800',
  },
  statSub: {
    color: '#45B66F',
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justify.content: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: BLACK,
    fontWeight: 'bold',
    fontSize: 13,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  actionButton: {
    alignItems: 'center',
    width: '22%',
    minWidth: 70,
  },
  actionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionIconBoxSecondary: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: FIELD,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    color: WHITE,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FIELD,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  docIconPDF: {
    width: 46,
    height: 56,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GOLD,
  },
  docInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  docTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  docClass: {
    color: MUTED,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: FIELD,
    width: '100%',
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  modalTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: BLACK,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: 12,
    color: WHITE,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalCancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalCancelText: {
    color: MUTED,
    fontSize: 16,
  },
  modalAddBtn: {
    backgroundColor: GOLD,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  modalAddText: {
    color: BLACK,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

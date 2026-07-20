import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, type Href } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ClassService } from '@/src/services/ClassService';
import type { TeacherClass } from '@/src/types/class.types';
import { spacing } from '@/src/theme/spacing';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#242424';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const WHITE = '#FFFFFF';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [classData, setClassData] = useState<TeacherClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddCourseVisible, setAddCourseVisible] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadClassDetails = () => {
    if (!id) return;
    ClassService.getClass(parseInt(id, 10)).then(res => {
      if (res.success) {
        setClassData(res.data);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    let active = true;
    if (!id) return;
    ClassService.getClass(parseInt(id, 10)).then(res => {
      if (active && res.success) {
        setClassData(res.data);
      }
      if (active) setLoading(false);
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  const handleAddCourse = async () => {
    if (!newCourseName.trim() || !id) return;
    setIsAdding(true);
    try {
      await ClassService.createCourse(parseInt(id, 10), newCourseName.trim());
      setAddCourseVisible(false);
      setNewCourseName('');
      loadClassDetails();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le cours.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{classData?.name || 'Classe'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={GOLD} size="large" style={{ marginTop: spacing.xl }} />
        ) : !classData ? (
          <Text style={styles.errorText}>Classe non trouvée.</Text>
        ) : (
          <>
            <View style={styles.classInfoBox}>
              <MaterialCommunityIcons name="google-classroom" size={48} color={GOLD} />
              <Text style={styles.className}>{classData.name}</Text>
              <Text style={styles.classSubtitle}>Sélectionnez un cours pour ouvrir l'assistant IA</Text>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Mes Cours</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setAddCourseVisible(true)}>
                <Ionicons name="add" size={20} color={BLACK} />
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
            {classData.courses && classData.courses.length > 0 ? (
              classData.courses.map(course => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseCard}
                  onPress={() => router.push({
                    pathname: '/ai',
                    params: { class_id: classData.id, course_id: course.id }
                  })}
                >
                  <View style={styles.courseIcon}>
                    <Ionicons name="book" size={24} color={GOLD} />
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseDesc}>Ouvrir l'IA pour {course.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={MUTED} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Aucun cours disponible.</Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Course Modal */}
      <Modal visible={isAddCourseVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau Cours</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom du cours (ex: Mathématiques)"
              placeholderTextColor={MUTED}
              value={newCourseName}
              onChangeText={setNewCourseName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAddCourseVisible(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddCourse} disabled={isAdding}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: FIELD_BORDER,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FIELD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: WHITE, fontSize: 18, fontWeight: 'bold' },
  content: { padding: spacing.lg },
  classInfoBox: {
    backgroundColor: FIELD,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  className: { color: WHITE, fontSize: 24, fontWeight: 'bold', marginTop: spacing.md },
  classSubtitle: { color: MUTED, fontSize: 14, marginTop: spacing.xs, textAlign: 'center' },
  sectionTitle: { color: WHITE, fontSize: 20, fontWeight: 'bold' },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 14,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FIELD,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: { flex: 1, marginLeft: spacing.md },
  courseName: { color: WHITE, fontSize: 16, fontWeight: 'bold' },
  courseDesc: { color: MUTED, fontSize: 13, marginTop: 2 },
  errorText: { color: '#ff4444', textAlign: 'center', marginTop: spacing.xl },
  emptyText: { color: MUTED, textAlign: 'center', marginTop: spacing.md },
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

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ClassService } from '@/src/services/ClassService';
import type { TeacherClass, Course } from '@/src/types/class.types';
import { spacing } from '@/src/theme/spacing';

const GOLD = '#F3D250'; // Adjusted for better visual match
const BLACK = '#000000';
const FIELD = '#1A1A1A'; // Darker grey card background
const FIELD_BORDER = '#2A2A2A';
const MUTED = '#9ca3af';
const WHITE = '#FFFFFF';
const DANGER_BG = 'rgba(239, 68, 68, 0.15)';
const DANGER_TEXT = '#ef4444';
const SUCCESS_BG = 'rgba(16, 185, 129, 0.15)';
const SUCCESS_TEXT = '#10b981';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [classData, setClassData] = useState<TeacherClass | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddCourseVisible, setAddCourseVisible] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [isEditClassVisible, setEditClassVisible] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [editClassLevel, setEditClassLevel] = useState('');
  const [isEditingClass, setIsEditingClass] = useState(false);

  const [isEditCourseVisible, setEditCourseVisible] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [isEditingCourse, setIsEditingCourse] = useState(false);

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

  const openEditClass = () => {
    if (!classData) return;
    setEditClassName(classData.name);
    setEditClassLevel(classData.level || '');
    setEditClassVisible(true);
  };

  const handleEditClass = async () => {
    if (!editClassName.trim() || !id) return;
    setIsEditingClass(true);
    try {
      await ClassService.updateClass(parseInt(id, 10), editClassName.trim(), editClassLevel.trim() || undefined);
      setEditClassVisible(false);
      loadClassDetails();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier la classe.');
    } finally {
      setIsEditingClass(false);
    }
  };

  const handleDeleteClass = () => {
    Alert.alert('Supprimer la classe', 'Voulez-vous vraiment supprimer cette classe et tous ses cours ?', [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Supprimer', 
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          try {
            await ClassService.deleteClass(parseInt(id, 10));
            router.back();
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer la classe.');
          }
        }
      }
    ]);
  };

  const openEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setEditCourseName(course.name);
    setEditCourseVisible(true);
  };

  const handleEditCourse = async () => {
    if (!editCourseName.trim() || !id || !courseToEdit) return;
    setIsEditingCourse(true);
    try {
      await ClassService.updateCourse(parseInt(id, 10), courseToEdit.id, editCourseName.trim());
      setEditCourseVisible(false);
      setCourseToEdit(null);
      loadClassDetails();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le cours.');
    } finally {
      setIsEditingCourse(false);
    }
  };

  const handleDeleteCourse = (courseId: number) => {
    Alert.alert('Supprimer le cours', 'Voulez-vous vraiment supprimer ce cours ?', [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Supprimer', 
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          try {
            await ClassService.deleteCourse(parseInt(id, 10), courseId);
            loadClassDetails();
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer le cours.');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={GOLD} size="large" style={{ marginTop: spacing.xl }} />
      </SafeAreaView>
    );
  }

  if (!classData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Classe non trouvée.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching the screenshot */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{classData.name}</Text>
        
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.iconButton} onPress={openEditClass}>
            <Ionicons name="pencil" size={18} color={GOLD} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: DANGER_BG }]} onPress={handleDeleteClass}>
            <Ionicons name="trash" size={18} color={DANGER_TEXT} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Class Card matching the screenshot */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardIconContainer}>
            <MaterialCommunityIcons name="google-classroom" size={32} color={BLACK} />
          </View>
          <Text style={styles.mainCardTitle}>{classData.name}</Text>
          <Text style={styles.mainCardSubtitle}>{classData.courses?.length || 0} cours disponible{classData.courses?.length !== 1 ? 's' : ''}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(243, 210, 80, 0.15)' }]}>
                <Ionicons name="book" size={18} color={GOLD} />
              </View>
              <Text style={styles.statValue}>{classData.courses?.length || 0}</Text>
              <Text style={styles.statLabel}>COURS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBadge, { backgroundColor: SUCCESS_BG }]}>
                <Ionicons name="sparkles" size={18} color={SUCCESS_TEXT} />
              </View>
              <Text style={styles.statValue}>IA</Text>
              <Text style={styles.statLabel}>ASSISTÉE</Text>
            </View>
          </View>
        </View>

        {/* Courses Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Mes Cours</Text>
            <Text style={styles.sectionSubtitle}>Sélectionnez un cours pour l'assistant IA</Text>
          </View>
          <TouchableOpacity style={styles.addButtonPill} onPress={() => setAddCourseVisible(true)}>
            <Ionicons name="add" size={18} color={BLACK} />
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* Courses List */}
        {classData.courses && classData.courses.length > 0 ? (
          classData.courses.map(course => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseCard}
              onPress={() => router.push({
                pathname: '/course/[id]',
                params: { id: String(course.id), name: course.name, class_id: String(classData.id) }
              })}
            >
              <View style={styles.courseIcon}>
                <Ionicons name="book-outline" size={24} color={GOLD} />
              </View>
              
              <View style={styles.courseInfo}>
                <Text style={styles.courseName}>{course.name}</Text>
                <View style={styles.iaBadge}>
                  <Ionicons name="sparkles" size={12} color={GOLD} />
                  <Text style={styles.iaBadgeText}>IA disponible</Text>
                </View>
              </View>
              
              <View style={styles.courseActions}>
                <TouchableOpacity style={styles.smallIconButton} onPress={(e) => { e.stopPropagation(); openEditCourse(course); }}>
                  <Ionicons name="pencil" size={14} color={MUTED} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallIconButton, { backgroundColor: DANGER_BG }]} onPress={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}>
                  <Ionicons name="trash" size={14} color={DANGER_TEXT} />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color={MUTED} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucun cours disponible.</Text>
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

      {/* Edit Class Modal */}
      <Modal visible={isEditClassVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier la Classe</Text>
            <TextInput
              style={[styles.modalInput, { marginBottom: spacing.md }]}
              placeholder="Nom de la classe"
              placeholderTextColor={MUTED}
              value={editClassName}
              onChangeText={setEditClassName}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Niveau (ex: 3ème, Lycée)"
              placeholderTextColor={MUTED}
              value={editClassLevel}
              onChangeText={setEditClassLevel}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditClassVisible(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleEditClass} disabled={isEditingClass}>
                {isEditingClass ? (
                  <ActivityIndicator color={BLACK} size="small" />
                ) : (
                  <Text style={styles.modalAddText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Course Modal */}
      <Modal visible={isEditCourseVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le Cours</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom du cours"
              placeholderTextColor={MUTED}
              value={editCourseName}
              onChangeText={setEditCourseName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditCourseVisible(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleEditCourse} disabled={isEditingCourse}>
                {isEditingCourse ? (
                  <ActivityIndicator color={BLACK} size="small" />
                ) : (
                  <Text style={styles.modalAddText}>Enregistrer</Text>
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FIELD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: WHITE, fontSize: 18, fontWeight: 'bold' },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: { padding: spacing.lg, paddingBottom: 100 },
  
  // Main Card Styles
  mainCard: {
    backgroundColor: FIELD,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  mainCardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mainCardTitle: {
    color: WHITE,
    fontSize: 28,
    fontWeight: 'bold',
  },
  mainCardSubtitle: {
    color: MUTED,
    fontSize: 14,
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: spacing.md,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: FIELD_BORDER,
  },

  // Courses List Styles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: { color: WHITE, fontSize: 20, fontWeight: 'bold' },
  sectionSubtitle: { color: MUTED, fontSize: 12, marginTop: 4 },
  addButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    borderWidth: 1,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: { flex: 1, marginLeft: spacing.md },
  courseName: { color: WHITE, fontSize: 16, fontWeight: 'bold' },
  iaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 210, 80, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    gap: 4,
  },
  iaBadgeText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: 'bold',
  },
  courseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  errorText: { color: '#ff4444', textAlign: 'center', marginTop: spacing.xl },
  emptyText: { color: MUTED, textAlign: 'center', marginTop: spacing.md },
  
  // Modals Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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

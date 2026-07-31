import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/src/theme/spacing';
import { ClassService } from '@/src/services/ClassService';

const GOLD = '#F3D250';
const BLACK = '#000000';
const FIELD = '#202020';
const FIELD_BORDER = '#2A2A2A';
const MUTED = '#9ca3af';
const WHITE = '#FFFFFF';
const DANGER_TEXT = '#ef4444';

export default function CourseDetailScreen() {
  const { id, name, class_id } = useLocalSearchParams<{ id: string; name: string; class_id: string }>();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddChapterVisible, setAddChapterVisible] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [isAddingChapter, setIsAddingChapter] = useState(false);

  const [isAddLessonVisible, setAddLessonVisible] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  const loadCourse = () => {
    if (!class_id || !id) return;
    ClassService.getCourseDetails(parseInt(class_id, 10), parseInt(id, 10))
      .then(res => {
        if (res.success) {
          setCourse(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourse();
  }, [id, class_id]);

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim() || !class_id || !id) return;
    setIsAddingChapter(true);
    try {
      await ClassService.createChapter(parseInt(class_id, 10), parseInt(id, 10), newChapterTitle.trim());
      setAddChapterVisible(false);
      setNewChapterTitle('');
      loadCourse();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le chapitre.');
    } finally {
      setIsAddingChapter(false);
    }
  };

  const handleDeleteChapter = (chapterId: number) => {
    Alert.alert('Supprimer le chapitre', 'Voulez-vous vraiment supprimer ce chapitre et ses leçons ?', [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Supprimer', style: 'destructive', 
        onPress: async () => {
          try {
            await ClassService.deleteChapter(parseInt(class_id, 10), parseInt(id, 10), chapterId);
            loadCourse();
          } catch (e) {
            Alert.alert('Erreur', 'Impossible de supprimer.');
          }
        } 
      }
    ]);
  };

  const openAddLesson = (chapterId: number) => {
    setActiveChapterId(chapterId);
    setNewLessonTitle('');
    setAddLessonVisible(true);
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim() || !activeChapterId || !class_id || !id) return;
    setIsAddingLesson(true);
    try {
      await ClassService.createLesson(parseInt(class_id, 10), parseInt(id, 10), activeChapterId, newLessonTitle.trim());
      setAddLessonVisible(false);
      setActiveChapterId(null);
      setNewLessonTitle('');
      loadCourse();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la leçon.');
    } finally {
      setIsAddingLesson(false);
    }
  };

  const handleDeleteLesson = (chapterId: number, lessonId: number) => {
    Alert.alert('Supprimer la leçon', 'Voulez-vous supprimer cette leçon ?', [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Supprimer', style: 'destructive', 
        onPress: async () => {
          try {
            await ClassService.deleteLesson(parseInt(class_id, 10), parseInt(id, 10), chapterId, lessonId);
            loadCourse();
          } catch (e) {
            Alert.alert('Erreur', 'Impossible de supprimer.');
          }
        } 
      }
    ]);
  };

  const displayTitle = course?.name || name || 'Cours';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={GOLD} size="large" style={{ marginTop: spacing.xl }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{displayTitle}</Text>
        
        <TouchableOpacity style={styles.addChapterBtn} onPress={() => setAddChapterVisible(true)}>
          <Ionicons name="add" size={20} color={BLACK} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {course?.chapters?.length > 0 ? (
          course.chapters.map((chapter: any) => (
            <View key={chapter.id} style={styles.chapterCard}>
              {/* Chapter Header */}
              <View style={styles.chapterHeader}>
                <View style={styles.chapterTitleRow}>
                  <View style={styles.greyDot} />
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                </View>
                
                <View style={styles.chapterActions}>
                  <TouchableOpacity style={styles.addLessonBtn} onPress={() => openAddLesson(chapter.id)}>
                    <Ionicons name="add" size={16} color={GOLD} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteChapterBtn} onPress={() => handleDeleteChapter(chapter.id)}>
                    <Ionicons name="trash" size={14} color={DANGER_TEXT} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Lessons List */}
              <View style={styles.lessonsContainer}>
                <View style={styles.verticalLine} />
                <View style={styles.lessonsList}>
                  {chapter.lessons && chapter.lessons.map((lesson: any) => (
                    <Link 
                      key={lesson.id}
                      href={`/assistant?class_id=${class_id}&course_id=${id}&chapterId=${chapter.id}&lessonId=${lesson.id}` as any}
                      asChild
                    >
                      <TouchableOpacity style={styles.lessonRow}>
                        <View style={styles.lessonLeft}>
                          <Ionicons name="document-text-outline" size={18} color={MUTED} />
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        </View>
                        <View style={styles.lessonRight}>
                          <TouchableOpacity style={styles.deleteLessonBtn} onPress={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteLesson(chapter.id, lesson.id); }}>
                            <Ionicons name="trash" size={14} color={MUTED} />
                          </TouchableOpacity>
                          <View style={styles.greyDotSmall} />
                        </View>
                      </TouchableOpacity>
                    </Link>
                  ))}
                  {(!chapter.lessons || chapter.lessons.length === 0) && (
                    <Text style={{ color: MUTED, fontSize: 12, fontStyle: 'italic', paddingVertical: 4 }}>Aucune leçon.</Text>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: MUTED, textAlign: 'center', marginTop: spacing.xl }}>Aucun chapitre créé. Ajoutez-en un avec le bouton +</Text>
        )}
      </ScrollView>

      {/* Add Chapter Modal */}
      <Modal visible={isAddChapterVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau Chapitre</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Titre du chapitre (ex: Introduction)"
              placeholderTextColor={MUTED}
              value={newChapterTitle}
              onChangeText={setNewChapterTitle}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAddChapterVisible(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddChapter} disabled={isAddingChapter}>
                {isAddingChapter ? <ActivityIndicator color={BLACK} size="small" /> : <Text style={styles.modalAddText}>Créer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal visible={isAddLessonVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle Leçon</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Titre de la leçon"
              placeholderTextColor={MUTED}
              value={newLessonTitle}
              onChangeText={setNewLessonTitle}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAddLessonVisible(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddLesson} disabled={isAddingLesson}>
                {isAddingLesson ? <ActivityIndicator color={BLACK} size="small" /> : <Text style={styles.modalAddText}>Créer</Text>}
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
  addChapterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: spacing.lg, paddingBottom: 100 },
  chapterCard: {
    backgroundColor: FIELD,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  chapterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  greyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: MUTED },
  chapterTitle: { color: WHITE, fontSize: 16, fontWeight: 'bold' },
  chapterActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addLessonBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteChapterBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonsContainer: { flexDirection: 'row', marginLeft: 3 },
  verticalLine: { width: 2, backgroundColor: FIELD_BORDER, marginRight: spacing.lg },
  lessonsList: { flex: 1, gap: spacing.sm },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  lessonTitle: { color: '#d1d5db', fontSize: 14, flexShrink: 1 },
  lessonRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteLessonBtn: { padding: 4 },
  greyDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: MUTED },
  
  // Modals Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: FIELD, width: '100%', borderRadius: 20, padding: spacing.xl, borderWidth: 1, borderColor: FIELD_BORDER },
  modalTitle: { color: WHITE, fontSize: 18, fontWeight: 'bold', marginBottom: spacing.lg },
  modalInput: { backgroundColor: BLACK, borderWidth: 1, borderColor: FIELD_BORDER, borderRadius: 12, color: WHITE, padding: spacing.md, fontSize: 16, marginBottom: spacing.xl },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
  modalCancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  modalCancelText: { color: MUTED, fontSize: 16 },
  modalAddBtn: { backgroundColor: GOLD, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: 12, minWidth: 80, alignItems: 'center' },
  modalAddText: { color: BLACK, fontSize: 16, fontWeight: 'bold' },
});

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseContentService } from '@/src/services/CourseContentService';
import { AiService } from '@/src/services/AiService';
import { Chapter } from '@/src/types/class.types';
import { spacing } from '@/src/theme/spacing';
import Markdown from 'react-native-markdown-display';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#242424';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const WHITE = '#FFFFFF';

export default function ChapterEditorScreen() {
  const router = useRouter();
  const { chapterId, courseId } = useLocalSearchParams();
  
  const cId = Number(courseId);
  const isAiDraft = chapterId === 'ai';
  const chId = isAiDraft ? 0 : Number(chapterId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingAs, setExportingAs] = useState<'pdf' | 'word' | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [isEditing, setIsEditing] = useState(true);
  const [isStudentMode, setIsStudentMode] = useState(false);

  const contentInputRef = useRef<TextInput>(null);

  const getDisplayContent = () => {
    if (isStudentMode && content.includes('[SECTION_CORRIGE]')) {
      return content.split('[SECTION_CORRIGE]')[0].trim();
    }
    return content.replace(/\[SECTION_CORRIGE\]/g, '\n\n## 📝 CORRIGÉ (Réservé à l\'enseignant)\n\n');
  };

  useEffect(() => {
    const fetchChapter = async () => {
      if (isAiDraft) {
        // Load content from AsyncStorage
        const draftContent = await AsyncStorage.getItem('temp_ai_content');
        if (draftContent) {
          setTitle('Document généré');
          setContent(draftContent);
          // Set a fake chapter to satisfy the render
          setChapter({ id: 0, title: 'Brouillon', content: draftContent, course_id: cId, order: 0, status: 'pending' });
        } else {
          Alert.alert('Erreur', 'Aucun brouillon trouvé.');
        }
        setLoading(false);
        return;
      }

      try {
        const response = await CourseContentService.getChapters(cId);
        if (response.success) {
          const foundChapter = response.data.find((c: Chapter) => c.id === chId);
          if (foundChapter) {
            setChapter(foundChapter);
            setTitle(foundChapter.title);
            setContent(foundChapter.content || '');
          }
        }
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de charger le chapitre.');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [cId, chId, isAiDraft]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre ne peut pas être vide.');
      return;
    }
    setSaving(true);
    try {
      if (isAiDraft) {
        const response = await CourseContentService.createChapter(cId, {
          title,
          content,
        });
        if (response.success) {
          Alert.alert('Succès', 'Document enregistré en base.');
          router.replace(`/chapter/${response.data.id}?courseId=${cId}`);
        }
      } else {
        const response = await CourseContentService.updateChapter(cId, chId, {
          title,
          content,
        });
        if (response.success) {
          Alert.alert('Succès', 'Document enregistré en base.');
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'word') => {
    const contentToExport = getDisplayContent();
    if (!contentToExport.trim()) return;
    setExportingAs(format);
    try {
      const modeSuffix = isStudentMode ? ' (Élève)' : ' (Enseignant)';
      const exportTitle = (title || 'Document') + modeSuffix;
      
      const res = await AiService.exportChat(contentToExport, format, exportTitle);
      if (res.success && res.data?.download_url) {
        const mode = isStudentMode ? '(Version Élève)' : '(Version Enseignant)';
        Alert.alert('Succès', `Le document ${mode} a été exporté en ${format.toUpperCase()} et sauvegardé dans vos Documents.`);
        if (Platform.OS === 'web') {
          window.open(res.data.download_url, '_blank');
        }
      } else {
        throw new Error('Erreur serveur lors de la génération.');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'exporter le document.');
    } finally {
      setExportingAs(null);
    }
  };

  const handleCreateExam = async () => {
    try {
      const contentToExport = getDisplayContent() || '';
      
      if (!contentToExport.trim()) {
        if (Platform.OS === 'web') alert('Erreur: Le contenu est vide.');
        else Alert.alert('Erreur', 'Le contenu est vide.');
        return;
      }
      
      const payload = {
        title: title || 'Examen',
        content: contentToExport
      };
      
      await AsyncStorage.setItem('pending_exam_content', JSON.stringify(payload));
      
      router.push('/exam/create');
    } catch (e: any) {
      if (Platform.OS === 'web') alert('Erreur: ' + e.message);
      else Alert.alert('Erreur', 'Impossible de préparer l\'examen: ' + e.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>Ouverture du document...</Text>
      </SafeAreaView>
    );
  }

  if (!chapter) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Document introuvable.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        
        <View style={styles.toolbarGroup}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, isEditing && styles.toggleBtnActive]} 
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={16} color={isEditing ? BLACK : MUTED} />
              <Text style={[styles.toggleBtnText, isEditing && styles.toggleBtnTextActive]}>Éditer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, !isEditing && styles.toggleBtnActive]} 
              onPress={() => setIsEditing(false)}
            >
              <Ionicons name="eye-outline" size={16} color={!isEditing ? BLACK : MUTED} />
              <Text style={[styles.toggleBtnText, !isEditing && styles.toggleBtnTextActive]}>Aperçu Final</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.toolbarGroup}>
          <View style={[styles.toggleContainer, { borderColor: isStudentMode ? '#28a745' : '#17a2b8' }]}>
            <TouchableOpacity 
              style={[styles.toggleBtn, isStudentMode && { backgroundColor: '#28a745' }]} 
              onPress={() => setIsStudentMode(true)}
            >
              <Ionicons name="people-outline" size={16} color={isStudentMode ? WHITE : MUTED} />
              <Text style={[styles.toggleBtnText, isStudentMode && { color: WHITE }]}>Élèves</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, !isStudentMode && { backgroundColor: '#17a2b8' }]} 
              onPress={() => setIsStudentMode(false)}
            >
              <Ionicons name="school-outline" size={16} color={!isStudentMode ? WHITE : MUTED} />
              <Text style={[styles.toggleBtnText, !isStudentMode && { color: WHITE }]}>Prof</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.toolbarActions}>
          <TouchableOpacity 
            style={[styles.exportBtn, exportingAs === 'pdf' && styles.exporting]} 
            onPress={() => handleExport('pdf')}
            disabled={exportingAs !== null}
          >
            {exportingAs === 'pdf' ? <ActivityIndicator size="small" color={GOLD} /> : <Ionicons name="document-text-outline" size={18} color={MUTED} />}
            <Text style={styles.exportBtnText}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.exportBtn, exportingAs === 'word' && styles.exporting]} 
            onPress={() => handleExport('word')}
            disabled={exportingAs !== null}
          >
            {exportingAs === 'word' ? <ActivityIndicator size="small" color={GOLD} /> : <Ionicons name="document-outline" size={18} color={MUTED} />}
            <Text style={styles.exportBtnText}>Word</Text>
          </TouchableOpacity>

          {(content.includes('[SECTION_CORRIGE]') || title.toLowerCase().includes('exercice') || title.toLowerCase().includes('quiz') || title.toLowerCase().includes('évaluation')) && (
            <TouchableOpacity 
              style={[styles.exportBtn, { borderColor: '#4299E1', backgroundColor: 'rgba(66, 153, 225, 0.1)' }]} 
              onPress={handleCreateExam}
            >
              <Ionicons name="school-outline" size={18} color="#4299E1" />
              <Text style={[styles.exportBtnText, { color: '#4299E1' }]}>Créer Examen</Text>
            </TouchableOpacity>
          )}

          {saving ? (
            <ActivityIndicator color={GOLD} style={{ marginLeft: spacing.md }} />
          ) : (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="save-outline" size={18} color={BLACK} />
              <Text style={styles.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.scrollCanvas} 
          contentContainerStyle={styles.canvasContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.paper}>
            {isEditing ? (
              <TextInput
                style={styles.paperTitle}
                value={title}
                onChangeText={setTitle}
                placeholder="Titre du document..."
                placeholderTextColor="#CCCCCC"
                multiline
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.paperTitlePreview}>{title}</Text>
            )}
            
            {isEditing ? (
              <TextInput
                ref={contentInputRef}
                style={styles.paperContent}
                value={content}
                onChangeText={setContent}
                placeholder="Commencez à écrire ici..."
                placeholderTextColor="#CCCCCC"
                multiline
                scrollEnabled={false}
                textAlignVertical="top"
              />
            ) : (
              <View style={styles.previewContainer}>
                <Markdown style={markdownStyles}>
                  {getDisplayContent() || '*Aucun contenu à afficher.*'}
                </Markdown>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  heading2: {
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  heading3: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    marginBottom: 12,
  },
  strong: {
    fontWeight: 'bold',
    color: '#000000',
  },
  em: {
    fontStyle: 'italic',
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 12,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: MUTED,
    marginTop: spacing.md,
    fontSize: 16,
  },
  backButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: FIELD,
    borderRadius: 8,
  },
  backText: {
    color: WHITE,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: BLACK,
    borderBottomWidth: 1,
    borderBottomColor: FIELD_BORDER,
  },
  toolbarBtn: {
    padding: 8,
  },
  toolbarGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: FIELD,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: GOLD,
  },
  toggleBtnText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: BLACK,
  },
  toolbarActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: FIELD,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    gap: 6,
  },
  exporting: {
    opacity: 0.7,
  },
  exportBtnText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginLeft: 8,
  },
  saveBtnText: {
    color: BLACK,
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollCanvas: {
    flex: 1,
  },
  canvasContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    paddingBottom: 100,
  },
  paper: {
    backgroundColor: WHITE,
    width: '100%',
    maxWidth: 1100,
    minHeight: 1200,
    borderRadius: 8,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  paperTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  paperTitlePreview: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    paddingBottom: 10,
  },
  paperContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    minHeight: 500,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', 
  },
  previewContainer: {
    minHeight: 500,
  }
});

import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { ExamService } from '../../services/ExamService';

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

const SEPARATOR_TAG = '[SECTION_CORRIGE]';

export const CreateExamScreen = React.memo(() => {
  const [title, setTitle] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [duration, setDuration] = useState('60');
  const [maxScore, setMaxScore] = useState('20');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');

  const [isCreating, setIsCreating] = useState(false);
  const [createdExam, setCreatedExam] = useState<{
    public_url: string;
    token: string;
    id: number;
  } | null>(null);

  useEffect(() => {
    const loadPendingData = async () => {
      try {
        const pendingDataStr = await AsyncStorage.getItem('pending_exam_content');
        if (pendingDataStr) {
          const pendingData = JSON.parse(pendingDataStr);
          if (pendingData.title) setTitle(pendingData.title);
          if (pendingData.content) setRawContent(pendingData.content);
          // Ne pas supprimer immédiatement pour éviter les bugs avec React Strict Mode
          // On le supprime dans un setTimeout ou au démontage
          setTimeout(() => {
            AsyncStorage.removeItem('pending_exam_content').catch(() => {});
          }, 2000);
        }
      } catch (e) {
        console.log('Error loading pending exam data', e);
      }
    };
    loadPendingData();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour l\'épreuve.');
      return;
    }
    if (!rawContent.trim()) {
      Alert.alert('Erreur', 'Veuillez coller le contenu de l\'épreuve.');
      return;
    }
    const dur = parseInt(duration, 10);
    if (isNaN(dur) || dur < 5 || dur > 480) {
      Alert.alert('Erreur', 'La durée doit être entre 5 et 480 minutes.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!dateRegex.test(examDate)) {
      Alert.alert('Erreur', 'Veuillez saisir la date au format AAAA-MM-JJ');
      return;
    }
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert('Erreur', 'Veuillez saisir les heures au format HH:MM');
      return;
    }

    setIsCreating(true);

    try {
      // Séparer l'épreuve et le corrigé automatiquement
      let content = rawContent;
      let answerKey: string | undefined;

      const separatorIdx = rawContent.indexOf(SEPARATOR_TAG);
      if (separatorIdx !== -1) {
        content = rawContent.substring(0, separatorIdx).trim();
        answerKey = rawContent.substring(separatorIdx + SEPARATOR_TAG.length).trim();
      }

      const res = await ExamService.create({
        title: title.trim(),
        content,
        answer_key: answerKey,
        duration_minutes: dur,
        max_score: parseInt(maxScore, 10) || 20,
        exam_date: examDate,
        start_time: startTime,
        end_time: endTime,
      });

      if (res.success && res.data) {
        setCreatedExam({
          public_url: res.data.public_url,
          token: res.data.token,
          id: res.data.id,
        });
      } else {
        Alert.alert('Erreur', res.message || 'Impossible de créer l\'examen.');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de la création.';
      Alert.alert('Erreur', msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/markdown', 'text/csv', 'application/json'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        try {
          const fileContent = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
          setRawContent(fileContent);
          Alert.alert('Succès', 'Le contenu du fichier a été importé dans l\'éditeur.');
        } catch (readError) {
          Alert.alert('Erreur', 'Impossible de lire le contenu de ce fichier. Assurez-vous qu\'il s\'agit d\'un fichier texte (.txt, .md).');
        }
      }
    } catch (err) {
      console.log('Erreur lors de la sélection du document:', err);
    }
  };

  const handleCopyLink = async () => {
    if (!createdExam) return;
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(createdExam.public_url);
      } else {
        try {
          const Clipboard = require('expo-clipboard');
          await Clipboard.setStringAsync(createdExam.public_url);
        } catch {
          Alert.alert('Lien', createdExam.public_url);
          return;
        }
      }
      Alert.alert('✅ Copié !', 'Le lien a été copié. Partagez-le avec vos étudiants.');
    } catch {
      Alert.alert('Erreur', 'Impossible de copier le lien.');
    }
  };

  // ─── Success View ───────────────────────────────────────
  if (createdExam) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={{ fontSize: 48 }}>🎉</Text>
          </View>
          <Text style={styles.successTitle}>Évaluation créée !</Text>
          <Text style={styles.successSubtitle}>
            Partagez le lien ci-dessous avec vos étudiants.{'\n'}
            Ils pourront composer directement depuis leur navigateur.
          </Text>

          <View style={styles.linkCard}>
            <Text style={styles.linkLabel}>Lien de l'épreuve</Text>
            <View style={styles.linkRow}>
              <Text style={styles.linkUrl} numberOfLines={2} selectable>
                {createdExam.public_url}
              </Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
              <Ionicons name="copy" size={18} color="#000" />
              <Text style={styles.copyBtnText}>Copier le lien</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.push(`/exam/${createdExam.id}` as any)}
            >
              <Ionicons name="eye-outline" size={18} color={GOLD} />
              <Text style={styles.secondaryBtnText}>Voir l'examen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={18} color={MUTED} />
              <Text style={[styles.secondaryBtnText, { color: MUTED }]}>Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Creation Form ───────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={WHITE} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Créer une évaluation</Text>
            <Text style={styles.headerSubtitle}>
              Collez le contenu de l'épreuve
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Titre de l'épreuve *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Évaluation de Mathématiques — Chapitre 3"
              placeholderTextColor="#555"
              maxLength={255}
            />
          </View>

          {/* Duration & Max Score */}
          <View style={styles.rowInputs}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Durée (minutes) *</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="60"
                placeholderTextColor="#555"
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            <View style={{ width: 14 }} />
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Barème</Text>
              <TextInput
                style={styles.input}
                value={maxScore}
                onChangeText={setMaxScore}
                placeholder="20"
                placeholderTextColor="#555"
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          {/* Date & Heures */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de l'épreuve *</Text>
            {Platform.OS === 'web' ? (
              createElement('input', {
                type: 'date',
                value: examDate,
                onChange: (e: any) => setExamDate(e.target.value),
                style: {
                  backgroundColor: '#1E1E1E',
                  color: '#FFFFFF',
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#333',
                  fontSize: 16,
                  fontFamily: 'inherit',
                  width: '100%',
                  outline: 'none'
                }
              })
            ) : (
              <TextInput
                style={styles.input}
                value={examDate}
                onChangeText={setExamDate}
                placeholder="YYYY-MM-DD (ex: 2026-09-01)"
                placeholderTextColor="#555"
                maxLength={10}
              />
            )}
          </View>
          
          <View style={styles.rowInputs}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Heure de début *</Text>
              {Platform.OS === 'web' ? (
                createElement('input', {
                  type: 'time',
                  value: startTime,
                  onChange: (e: any) => setStartTime(e.target.value),
                  style: {
                    backgroundColor: '#1E1E1E',
                    color: '#FFFFFF',
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#333',
                    fontSize: 16,
                    fontFamily: 'inherit',
                    width: '100%',
                    outline: 'none'
                  }
                })
              ) : (
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="08:00"
                  placeholderTextColor="#555"
                  maxLength={5}
                />
              )}
            </View>
            <View style={{ width: 14 }} />
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Heure de fin *</Text>
              {Platform.OS === 'web' ? (
                createElement('input', {
                  type: 'time',
                  value: endTime,
                  onChange: (e: any) => setEndTime(e.target.value),
                  style: {
                    backgroundColor: '#1E1E1E',
                    color: '#FFFFFF',
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#333',
                    fontSize: 16,
                    fontFamily: 'inherit',
                    width: '100%',
                    outline: 'none'
                  }
                })
              ) : (
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:00"
                  placeholderTextColor="#555"
                  maxLength={5}
                />
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.formGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Contenu de l'épreuve *</Text>
              <TouchableOpacity onPress={handleImportDocument} style={styles.importBtn}>
                <Ionicons name="document-text-outline" size={14} color={GOLD} />
                <Text style={styles.importBtnText}>Importer un fichier</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.labelHint}>
              💡 Collez ici le contenu de l'épreuve. Si le texte contient la balise
              [SECTION_CORRIGE], l'épreuve et le corrigé seront séparés automatiquement.
            </Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              value={rawContent}
              onChangeText={setRawContent}
              placeholder={"Collez ici le contenu de l'épreuve...\n\nExemple :\nExercice 1 : ...\nExercice 2 : ...\n\n[SECTION_CORRIGE]\nCorrigé de l'exercice 1 : ...\nCorrigé de l'exercice 2 : ..."}
              placeholderTextColor="#444"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color={GOLD} />
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: '700', color: GOLD }}>Mesures anti-triche actives :</Text>
              {'\n'}• Détection de sortie d'écran (2 max)
              {'\n'}• Blocage du copier-coller
              {'\n'}• Mode plein écran obligatoire
              {'\n'}• Chronomètre synchronisé serveur
              {'\n'}• Filigrane avec le nom de l'étudiant
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isCreating && styles.submitBtnDisabled]}
            onPress={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Ionicons name="rocket" size={20} color="#000" />
                <Text style={styles.submitBtnText}>Créer l'évaluation</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  labelHint: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 10,
    lineHeight: 18,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GOLD_DIM,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  importBtnText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: FIELD,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: WHITE,
  },
  contentInput: {
    minHeight: 250,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: GOLD_DIM,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: MUTED,
    lineHeight: 20,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },

  // Success
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(56,161,105,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  linkCard: {
    width: '100%',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  linkRow: {
    backgroundColor: FIELD,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  linkUrl: {
    fontSize: 13,
    color: GOLD,
    fontWeight: '500',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD,
    paddingVertical: 12,
    borderRadius: 10,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  successActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: FIELD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: GOLD,
  },
});

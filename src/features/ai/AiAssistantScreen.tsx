import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { AiService } from '../../services/AiService';
import { useAuth } from '../../hooks/useAuth';
import { spacing } from '../../theme/spacing';
import type { AiAgentOption, AiGenerationResult, AiGenerationType } from '../../types/ai.types';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#242424';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const GREEN = '#45B66F';
const WHITE = '#FFFFFF';

const generationTypes: { value: AiGenerationType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'lesson_plan', label: 'Fiche', icon: 'document-text-outline' },
  { value: 'exercise', label: 'Exercices', icon: 'create-outline' },
  { value: 'quiz', label: 'Quiz', icon: 'help-circle-outline' },
  { value: 'summary', label: 'Resume', icon: 'reader-outline' },
  { value: 'correction', label: 'Correction', icon: 'checkmark-done-outline' },
];

export const AiAssistantScreen = React.memo(() => {
  const { state } = useAuth();
  const [type, setType] = useState<AiGenerationType>('lesson_plan');
  const [theme, setTheme] = useState('');
  const [niveau, setNiveau] = useState('');
  const [matiere, setMatiere] = useState('');
  const [duree, setDuree] = useState('');
  const [objectifs, setObjectifs] = useState('');
  const [consignes, setConsignes] = useState('');
  const [result, setResult] = useState<AiGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<AiAgentOption[]>([]);
  const [agent, setAgent] = useState<string>('');
  const [planLabel, setPlanLabel] = useState<string>('');

  useEffect(() => {
    let active = true;
    AiService.getAgents()
      .then((res) => {
        if (!active || !res.success || !res.data) {
          return;
        }
        setAgents(res.data.agents);
        setPlanLabel(res.data.plan_label);
        setAgent(res.data.default_agent);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const canGenerate = useMemo(() => theme.trim().length >= 3 && !isLoading, [isLoading, theme]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      Alert.alert('Theme requis', 'Indiquez un theme de cours avant de lancer la generation.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await AiService.generateContent({
        type,
        theme: theme.trim(),
        niveau: niveau.trim() || undefined,
        matiere: matiere.trim() || undefined,
        duree: duree.trim() || undefined,
        objectifs: objectifs.trim() || undefined,
        consignes: consignes.trim() || undefined,
        agent: agent || undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Impossible de generer la ressource.');
      }

      setResult(response.data);
    } catch (error) {
      Alert.alert(
        'Generation impossible',
        error instanceof Error ? error.message : 'Une erreur est survenue.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [canGenerate, consignes, duree, matiere, niveau, objectifs, theme, type]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <MaterialCommunityIcons name="book-open-variant" size={38} color={GOLD} />
              <Text style={styles.brand}>EduAssist</Text>
            </View>
            <Text style={styles.title}>Assistant IA</Text>
            <Text style={styles.subtitle}>
              {state.user?.name ? `${state.user.name}, preparez une ressource en quelques secondes.` : 'Preparez une ressource en quelques secondes.'}
            </Text>
          </View>

          <View style={styles.typeGrid}>
            {generationTypes.map((item) => {
              const selected = item.value === type;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.typeButton, selected && styles.selectedTypeButton]}
                  onPress={() => setType(item.value)}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Ionicons name={item.icon} size={20} color={selected ? BLACK : GOLD} />
                  <Text style={[styles.typeText, selected && styles.selectedTypeText]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.agentBlock}>
            <View style={styles.agentHeader}>
              <Text style={styles.agentTitle}>Agent IA</Text>
              {planLabel !== '' && <Text style={styles.agentPlan}>{planLabel}</Text>}
            </View>
            <Text style={styles.agentHint}>
              Changez d agent selon votre forfait. Les agents verrouilles necessitent une mise a niveau.
            </Text>
            <View style={styles.agentGrid}>
              {agents.map((item) => {
                const selected = item.id === agent;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.agentButton,
                      selected && styles.selectedAgentButton,
                      !item.unlocked && styles.lockedAgentButton,
                    ]}
                    onPress={() => {
                      if (!item.unlocked) {
                        Alert.alert(
                          'Agent verrouille',
                          `L agent ${item.label} fait partie d un forfait superieur. Mettez a niveau votre abonnement pour l utiliser.`
                        );
                        return;
                      }
                      setAgent(item.id);
                    }}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Ionicons
                      name={!item.unlocked ? 'lock-closed-outline' : selected ? 'checkmark-circle' : 'sparkles-outline'}
                      size={18}
                      color={selected ? BLACK : item.unlocked ? GOLD : MUTED}
                    />
                    <Text style={[styles.agentText, selected && styles.selectedAgentText, !item.unlocked && styles.lockedAgentText]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.form}>
            <AiInput
              label="Theme"
              placeholder="Fractions, accord du participe passe..."
              value={theme}
              onChangeText={setTheme}
              required
              editable={!isLoading}
            />
            <View style={styles.inlineFields}>
              <AiInput label="Niveau" placeholder="CM2" value={niveau} onChangeText={setNiveau} editable={!isLoading} />
              <AiInput label="Duree" placeholder="45 min" value={duree} onChangeText={setDuree} editable={!isLoading} />
            </View>
            <AiInput
              label="Matiere"
              placeholder="Mathematiques"
              value={matiere}
              onChangeText={setMatiere}
              editable={!isLoading}
            />
            <AiInput
              label="Objectifs"
              placeholder="Ce que les eleves doivent savoir faire"
              value={objectifs}
              onChangeText={setObjectifs}
              multiline
              editable={!isLoading}
            />
            <AiInput
              label="Consignes"
              placeholder="Contraintes, nombre de questions, niveau de difficulte..."
              value={consignes}
              onChangeText={setConsignes}
              multiline
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.generateButton, !canGenerate && styles.disabledButton]}
            onPress={handleGenerate}
            disabled={!canGenerate}
            activeOpacity={0.86}
          >
            <LinearGradient
              colors={['#F7DA73', '#D4AF37', '#AA8C1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Ionicons name="sparkles-outline" size={22} color={BLACK} />
              <Text style={styles.generateText}>{isLoading ? 'Generation...' : 'Generer'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultBlock}>
              <View style={styles.resultHeader}>
                <View style={styles.resultTitleRow}>
                  <Ionicons name="checkmark-circle" size={22} color={GREEN} />
                  <Text style={styles.resultTitle}>
                    {result.conversation_title || `${theme} ${niveau ? `— ${niveau}` : ''}`}
                  </Text>
                </View>
                <Text style={styles.resultMeta}>
                  {result.provider === 'local'
                    ? 'Mode local'
                    : `${result.agent ?? 'gemini'}${result.model ? ` · ${result.model}` : ''}`}
                </Text>
              </View>
              {result.fallback && (
                <Text style={styles.fallbackText}>
                  Reponse locale generee en attendant la configuration IA serveur.
                </Text>
              )}
              <Text style={styles.resultContent}>{result.content}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && <LoadingOverlay message="Generation IA..." />}
    </SafeAreaView>
  );
});

AiAssistantScreen.displayName = 'AiAssistantScreen';

type AiInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  editable: boolean;
  multiline?: boolean;
  required?: boolean;
};

const AiInput = React.memo<AiInputProps>(({
  label,
  placeholder,
  value,
  onChangeText,
  editable,
  multiline = false,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isComplete = value.trim().length > 0;

  return (
    <View style={[styles.inputShell, isFocused && styles.focusedInput, multiline && styles.textAreaShell]}>
      <View style={styles.inputBlock}>
        <Text style={[styles.inputLabel, isFocused && styles.focusedLabel]}>
          {label}{required ? ' *' : ''}
        </Text>
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor={MUTED}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {isComplete && !multiline && <Ionicons name="checkmark" size={28} color={GREEN} />}
    </View>
  );
});

AiInput.displayName = 'AiInput';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  brand: {
    color: GOLD,
    fontSize: 28,
    fontWeight: '600',
  },
  title: {
    color: WHITE,
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
  },
  subtitle: {
    color: MUTED,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    alignItems: 'center',
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  selectedTypeButton: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  typeText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedTypeText: {
    color: BLACK,
  },
  agentBlock: {
    marginBottom: spacing.lg,
  },
  agentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  agentTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '800',
  },
  agentPlan: {
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 12,
    borderWidth: 1,
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  agentHint: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  agentButton: {
    alignItems: 'center',
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  selectedAgentButton: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  lockedAgentButton: {
    opacity: 0.6,
  },
  agentText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedAgentText: {
    color: BLACK,
  },
  lockedAgentText: {
    color: MUTED,
  },
  form: {
    gap: spacing.md,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: FIELD,
    borderColor: FIELD_BORDER,
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: spacing.lg,
  },
  focusedInput: {
    borderColor: GOLD,
    borderWidth: 2,
  },
  textAreaShell: {
    alignItems: 'flex-start',
    minHeight: 116,
    paddingVertical: spacing.md,
  },
  inputBlock: {
    flex: 1,
  },
  inputLabel: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  focusedLabel: {
    color: GOLD,
  },
  input: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '600',
    padding: 0,
  },
  textArea: {
    minHeight: 70,
  },
  generateButton: {
    borderRadius: 34,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.55,
  },
  gradientButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: spacing.lg,
  },
  generateText: {
    color: BLACK,
    fontSize: 24,
    fontWeight: '800',
  },
  resultBlock: {
    backgroundColor: '#111111',
    borderColor: FIELD_BORDER,
    borderRadius: 28,
    borderWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  resultHeader: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  resultTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  resultTitle: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '800',
  },
  resultMeta: {
    color: MUTED,
    fontSize: 13,
  },
  fallbackText: {
    color: GOLD,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  resultContent: {
    color: '#EFEFEF',
    fontSize: 15,
    lineHeight: 23,
  },
});

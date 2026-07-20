import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { AiService } from '../../services/AiService';
import { useAuth } from '../../hooks/useAuth';
import { spacing } from '../../theme/spacing';
import type { AiAgentOption, AiChatMessage } from '../../types/ai.types';

const GOLD = '#D4AF37';
const BLACK = '#000000';
const FIELD = '#242424';
const FIELD_BORDER = '#333333';
const MUTED = '#A9A9A9';
const WHITE = '#FFFFFF';
const USER_BUBBLE = '#1A1A1A';

interface ChatBubble {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

import { useLocalSearchParams } from 'expo-router';

export const AiAssistantScreen = React.memo(() => {
  const { state } = useAuth();
  const { class_id, course_id } = useLocalSearchParams<{ class_id: string; course_id: string }>();
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Bonjour ${state.user?.name || ''} ! Je suis EduAssist, votre assistant pédagogique IA.\n\nQue souhaitez-vous préparer aujourd'hui ?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<AiAgentOption[]>([]);
  const [agent, setAgent] = useState<string>('');
  const [planLabel, setPlanLabel] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    AiService.getAgents()
      .then((res) => {
        if (!active || !res.success || !res.data) return;
        setAgents(res.data.agents);
        setPlanLabel(res.data.plan_label);
        setAgent(res.data.default_agent);
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMessage: ChatBubble = {
      id: Date.now().toString(),
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Construction de l'historique pour l'API
    const history: AiChatMessage[] = messages
      .filter((m) => m.id !== 'welcome' && !m.isError)
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

    try {
      const response = await AiService.generateContent({
        message: text,
        history: history.length > 0 ? history : undefined,
        agent: agent || undefined,
        class_id: class_id ? parseInt(class_id, 10) : undefined,
        course_id: course_id ? parseInt(course_id, 10) : undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Impossible de générer une réponse.');
      }

      const aiMessage: ChatBubble = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.data.content,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatBubble = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [agent, inputText, isLoading, messages]);

  const renderBubble = (msg: ChatBubble) => {
    const isUser = msg.role === 'user';
    return (
      <View key={msg.id} style={[styles.bubbleWrapper, isUser ? styles.bubbleUserWrapper : styles.bubbleModelWrapper]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <MaterialCommunityIcons name="robot-outline" size={16} color={BLACK} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleModel,
            msg.isError && styles.bubbleError,
          ]}
        >
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextModel]}>
            {msg.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="robot-excited-outline" size={28} color={GOLD} />
          <Text style={styles.brand}>EduAssist Chat</Text>
        </View>
        <View style={styles.agentSelector}>
          <Text style={styles.agentPlan}>{planLabel || 'Agent IA'}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderBubble)}
          {isLoading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator color={GOLD} size="small" />
              <Text style={styles.loadingText}>L'IA réfléchit...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Demandez une leçon, un exercice..."
            placeholderTextColor={MUTED}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color={BLACK} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

AiAssistantScreen.displayName = 'AiAssistantScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: FIELD_BORDER,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  brand: {
    color: GOLD,
    fontSize: 20,
    fontWeight: '700',
  },
  agentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentPlan: {
    backgroundColor: FIELD,
    borderColor: GOLD,
    borderRadius: 12,
    borderWidth: 1,
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  keyboardView: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  bubbleUserWrapper: {
    alignSelf: 'flex-end',
  },
  bubbleModelWrapper: {
    alignSelf: 'flex-start',
    gap: spacing.sm,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: USER_BUBBLE,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  bubbleModel: {
    backgroundColor: FIELD,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: GOLD,
  },
  bubbleError: {
    borderColor: '#ff4444',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: WHITE,
  },
  bubbleTextModel: {
    color: '#EFEFEF',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    padding: spacing.md,
  },
  loadingText: {
    color: MUTED,
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: FIELD_BORDER,
    backgroundColor: BLACK,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: FIELD,
    color: WHITE,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 48,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

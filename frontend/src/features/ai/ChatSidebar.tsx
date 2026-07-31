import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../theme/spacing';
import type { AiConversation } from '../../types/ai.types';

const DARK = '#0A0A0A';
const BLACK = '#000000';
const FIELD = '#1A1A1A';
const FIELD_BORDER = '#2A2A2A';
const GOLD = '#D4AF37';
const GOLD_DIM = 'rgba(212,175,55,0.15)';
const WHITE = '#FFFFFF';
const MUTED = '#8A8A8A';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.8, 300);

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: AiConversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: number) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) => {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const renderItem = ({ item }: { item: AiConversation }) => {
    const isActive = item.id === activeConversationId;
    return (
      <TouchableOpacity
        style={[styles.item, isActive && styles.itemActive]}
        onPress={() => onSelectConversation(item.id)}
      >
        <Ionicons name="chatbubble-outline" size={18} color={isActive ? GOLD : MUTED} />
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, isActive && styles.itemTitleActive]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.itemDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onDeleteConversation(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={16} color={MUTED} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          ]}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        </Animated.View>
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.newButton} onPress={onNewConversation}>
            <Ionicons name="add" size={20} color={BLACK} />
            <Text style={styles.newButtonText}>Nouveau chat</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune conversation passée</Text>
          }
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BLACK,
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: DARK,
    borderRightWidth: 1,
    borderRightColor: FIELD_BORDER,
    zIndex: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: FIELD_BORDER,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 8,
    gap: spacing.sm,
  },
  newButtonText: {
    color: BLACK,
    fontWeight: '600',
    fontSize: 15,
  },
  listContent: {
    padding: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: 4,
    gap: spacing.sm,
  },
  itemActive: {
    backgroundColor: FIELD,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemTitleActive: {
    color: GOLD,
  },
  itemDate: {
    color: MUTED,
    fontSize: 11,
  },
  deleteButton: {
    padding: 4,
  },
  emptyText: {
    color: MUTED,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: 14,
  },
});

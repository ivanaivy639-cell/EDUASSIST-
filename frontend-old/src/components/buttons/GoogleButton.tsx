import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export const GoogleButton = React.memo<GoogleButtonProps>(({ onPress, loading }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    style={styles.button}
    accessibilityRole="button"
    accessibilityLabel="Continuer avec Google"
    accessibilityHint="Ouvre la fenetre de connexion Google"
  >
    <View style={styles.content}>
      <Ionicons name="logo-google" size={20} color={colors.textPrimary} />
      <Text style={styles.text}>
        {loading ? 'Connexion...' : 'Continuer avec Google'}
      </Text>
    </View>
  </TouchableOpacity>
));

GoogleButton.displayName = 'GoogleButton';

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
  },
});

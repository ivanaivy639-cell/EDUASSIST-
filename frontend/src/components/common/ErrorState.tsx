import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name="alert-circle-outline"
        size={64}
        color={colors.danger[400]}
      />
      <Text style={styles.title}>Une erreur est survenue</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="Réessayer"
          variant="outline"
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text.light.primary,
    marginTop: spacing[4],
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.text.light.muted,
    marginTop: spacing[2],
    textAlign: 'center',
    marginHorizontal: spacing[8],
  },
  retryButton: {
    marginTop: spacing[6],
  },
});

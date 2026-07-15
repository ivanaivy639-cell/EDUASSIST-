import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
}

export const LoadingOverlay = React.memo<LoadingOverlayProps>(({ 
  message = 'Chargement...', visible = true 
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  </Modal>
));

LoadingOverlay.displayName = 'LoadingOverlay';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.size.body,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
});

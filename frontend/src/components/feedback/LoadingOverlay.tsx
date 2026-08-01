import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
}

export const LoadingOverlay = React.memo<LoadingOverlayProps>(({ 
  message = 'Chargement...', visible = true 
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#333333',
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 220,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.size.body,
    color: '#FFFFFF',
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
});

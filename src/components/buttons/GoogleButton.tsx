import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { spacing } from '../../theme/spacing';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const GoogleButton = React.memo<GoogleButtonProps>(({ onPress, loading, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading || disabled}
    style={[styles.button, (loading || disabled) && styles.disabledButton]}
    accessibilityRole="button"
    accessibilityLabel="Continuer avec Google"
    accessibilityHint="Ouvre la fenetre de connexion Google"
  >
    <View style={styles.content}>
      <Text style={styles.googleMark}>G</Text>
      <Text style={styles.text}>
        {loading ? 'Connexion...' : 'Continuer avec Google'}
      </Text>
    </View>
  </TouchableOpacity>
));

GoogleButton.displayName = 'GoogleButton';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 34,
    minHeight: 78,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  googleMark: {
    color: '#4285F4',
    fontSize: 34,
    fontWeight: '800',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
  },
});

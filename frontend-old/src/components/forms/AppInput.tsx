import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Controller, Control, FieldError } from 'react-hook-form';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface AppInputProps extends TextInputProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
}

export const AppInput = React.memo<AppInputProps>(({
  name, control, label, placeholder, error, secureTextEntry, keyboardType, ...rest
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          onChangeText={onChange}
          onBlur={onBlur}
          value={value}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          accessibilityLabel={label}
          {...rest}
        />
      )}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
));

AppInput.displayName = 'AppInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.size.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

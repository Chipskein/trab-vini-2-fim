import React from 'react';
import {
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  type TextInputProps,
} from 'react-native';
import { colors, radius, spacing } from '../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'danger' | 'outline';
  disabled?: boolean;
}

export function Input({ label, style, ...props }: InputProps) {
  return (
    <View style={styles.inputWrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

export function Button({ title, onPress, loading, variant = 'primary', disabled }: ButtonProps) {
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading ?? disabled}
      style={[
        styles.button,
        isDanger && styles.buttonDanger,
        isOutline && styles.buttonOutline,
        (loading ?? disabled) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.buttonText, isOutline && styles.buttonTextOutline]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDanger: { backgroundColor: colors.danger },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  buttonTextOutline: { color: colors.primary },
});

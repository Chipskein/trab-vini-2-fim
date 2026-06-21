import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../utils/theme';

interface ListStateProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText?: string;
}

export function ListState({ loading, error, empty, emptyText = 'Nada por aqui ainda.' }: ListStateProps) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.danger, fontSize: 15, textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: 'center' },
});

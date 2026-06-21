import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, getErrorMessage } from '../utils/theme';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Informe e-mail e senha.');
      return;
    }
    try {
      setLoading(true);
      await signIn({ email, password });
    } catch (error) {
      Alert.alert('Erro no login', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoBox}>
            <Ionicons name="people-circle-outline" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>Bem-vindo</Text>
          <Text style={styles.subtitle}>Entre na sua conta</Text>

          <Input
            label="E-mail"
            placeholder="voce@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button title="Entrar" onPress={handleLogin} loading={loading} />

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>
              Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: spacing.xl, textAlign: 'center' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.muted, fontSize: 14 },
  linkBold: { color: colors.primary, fontWeight: '700' },
});

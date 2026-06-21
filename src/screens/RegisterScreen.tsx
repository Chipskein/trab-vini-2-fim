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
import { Input, Button } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, getErrorMessage } from '../utils/theme';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    try {
      setLoading(true);
      await signUp({ name, email, password });
    } catch (error) {
      Alert.alert('Erro no cadastro', getErrorMessage(error));
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
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>

          <Input
            label="Nome"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
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

          <Button title="Cadastrar" onPress={handleRegister} loading={loading} />

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: spacing.xl },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.muted, fontSize: 14 },
  linkBold: { color: colors.primary, fontWeight: '700' },
});

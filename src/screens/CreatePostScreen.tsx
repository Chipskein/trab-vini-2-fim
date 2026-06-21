import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input, Button } from '../components/UI';
import { createPostRequest } from '../api/services';
import { colors, spacing, radius, getErrorMessage } from '../utils/theme';
import type { PostsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<PostsStackParamList, 'CreatePost'>;

export default function CreatePostScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0] ?? null);
    }
  }

  async function handleCreate() {
    if (!title || !content) {
      Alert.alert('Atenção', 'Informe título e conteúdo.');
      return;
    }
    try {
      setLoading(true);
      await createPostRequest({ title, content, image });
      Alert.alert('Sucesso', 'Post criado com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro ao criar post', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="image-outline" size={48} color={colors.muted} />
                <Text style={styles.placeholderText}>Toque para escolher uma foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <Input
            label="Título"
            placeholder="Digite o título"
            value={title}
            onChangeText={setTitle}
          />
          <Input
            label="Conteúdo"
            placeholder="Escreva algo..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={5}
            style={styles.textarea}
          />

          <Button title="Publicar" onPress={handleCreate} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },
  imagePicker: {
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: colors.muted, fontSize: 14 },
  textarea: { height: 120, textAlignVertical: 'top' },
});

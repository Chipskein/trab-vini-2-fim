import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPostsRequest, deletePostRequest } from '../api/services';
import { BASE_URL } from '../api/client';
import { ListState } from '../components/ListState';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, normalizeList, getErrorMessage } from '../utils/theme';
import type { Post } from '../api/types';

const LIMIT = 10;

export default function MyPostsScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myId = user?.id ?? user?._id;

  const fetchPosts = useCallback(async (pageToLoad: number, mode: 'initial' | 'more' | 'refresh' = 'initial') => {
    try {
      if (mode === 'more') setLoadingMore(true);
      else if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await getPostsRequest({ page: pageToLoad, limit: LIMIT });

      setPosts((prev) => {
        const base = pageToLoad === 1 ? [] : prev;
        const { items, hasMore: more } = normalizeList<Post>(data, LIMIT, base.length);
        const mine = items.filter((p) => {
          const authorId = p.authorId ?? p.userId ?? p.user?.id ?? p.user?._id;
          return String(authorId) === String(myId);
        });
        setHasMore(more);
        return [...base, ...mine];
      });
      setPage(pageToLoad);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [myId]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts(1, 'initial');
    }, [fetchPosts])
  );

  function handleLoadMore() {
    if (!loadingMore && hasMore && !loading) {
      fetchPosts(page + 1, 'more');
    }
  }

  function confirmDelete(post: Post) {
    const id = post.id ?? post._id;
    Alert.alert(
      'Excluir post',
      `Tem certeza que deseja excluir "${post.title ?? 'este post'}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await deletePostRequest(id);
              setPosts((prev) => prev.filter((p) => (p.id ?? p._id) !== id));
            } catch (err) {
              Alert.alert('Erro', getErrorMessage(err));
            }
          },
        },
      ]
    );
  }

  function getImageUrl(post: Post): string | null {
    const raw =
      post.imageId ??
      post.foto ??
      post.fotoUrl ??
      post.photo ??
      post.image ??
      post.imageUrl ??
      post.photoUrl ??
      post.url ??
      null;
    if (!raw) return null;
    return raw.startsWith('http') ? raw : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
  }

  const renderItem: ListRenderItem<Post> = ({ item }) => {
    const img = getImageUrl(item);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.title} numberOfLines={1}>{item.title ?? 'Sem título'}</Text>
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {img ? (
          <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
        ) : null}

        <View style={styles.cardBody}>
          <Text style={styles.content}>{item.content ?? ''}</Text>
          <Text style={styles.date}>
            {item.createdAt ? new Date(item.createdAt as string).toLocaleDateString('pt-BR') : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Posts</Text>
      </View>

      {loading || error || posts.length === 0 ? (
        <ListState
          loading={loading}
          error={error}
          empty={!loading && !error && posts.length === 0}
          emptyText="Você ainda não criou nenhum post."
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, idx) => String(item.id ?? item._id ?? idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchPosts(1, 'refresh')} />
          }
          ListFooterComponent={
            loadingMore ? <Text style={styles.footer}>Carregando...</Text> : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  list: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: { flex: 1, fontWeight: '700', color: colors.text, fontSize: 15 },
  deleteBtn: {
    padding: spacing.xs,
  },
  image: { width: '100%', height: 200, backgroundColor: colors.border },
  cardBody: { padding: spacing.md },
  content: { fontSize: 14, color: colors.text, lineHeight: 20 },
  date: { fontSize: 12, color: colors.muted, marginTop: spacing.xs },
  footer: { textAlign: 'center', color: colors.muted, padding: spacing.md },
});

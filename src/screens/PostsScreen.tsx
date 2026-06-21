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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getPostsRequest, deletePostRequest } from '../api/services';
import { BASE_URL } from '../api/client';
import { ListState } from '../components/ListState';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, normalizeList, getErrorMessage } from '../utils/theme';
import type { Post } from '../api/types';
import type { PostsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<PostsStackParamList, 'PostsList'>;

const LIMIT = 10;

export default function PostsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setHasMore(more);
        return [...base, ...items];
      });
      setPage(pageToLoad);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

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
    // Normaliza caminhos relativos retornados pela API
    return raw.startsWith('http') ? raw : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
  }

  function isOwner(post: Post): boolean {
    const myId = user?.id ?? user?._id;
    const authorId = post.userId ?? post.authorId ?? post.user?.id ?? post.user?._id;
    if (!myId || !authorId) return true;
    return String(myId) === String(authorId);
  }

  const renderItem: ListRenderItem<Post> = ({ item }) => {
    const img = getImageUrl(item);
    const author = item.user?.name ?? item.author?.name ?? item.userName ?? 'Anônimo';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{author.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.author}>{author}</Text>
          {isOwner(item) && (
            <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>

        {img ? (
          <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
        ) : null}

        <View style={styles.cardBody}>
          <Text style={styles.title}>{item.title ?? 'Sem título'}</Text>
          <Text style={styles.content}>{item.content ?? ''}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Posts</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.newBtnText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {loading || error || posts.length === 0 ? (
        <ListState
          loading={loading}
          error={error}
          empty={!loading && !error && posts.length === 0}
          emptyText="Nenhum post ainda. Crie o primeiro!"
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  newBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  newBtnText: { color: colors.white, fontWeight: '700' },
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '800' },
  author: { flex: 1, fontWeight: '700', color: colors.text },
  deleteBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: '#FDEDED',
  },
  deleteText: { color: colors.danger, fontWeight: '700', fontSize: 12 },
  image: { width: '100%', height: 220, backgroundColor: colors.border },
  cardBody: { padding: spacing.md },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  content: { fontSize: 14, color: colors.text, lineHeight: 20 },
  footer: { textAlign: 'center', color: colors.muted, padding: spacing.md },
});

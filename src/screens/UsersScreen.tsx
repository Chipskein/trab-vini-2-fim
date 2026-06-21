import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUsersRequest } from '../api/services';
import { ListState } from '../components/ListState';
import { colors, spacing, radius, normalizeList, getErrorMessage } from '../utils/theme';
import type { User } from '../api/types';

const LIMIT = 10;

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (pageToLoad: number, mode: 'initial' | 'more' | 'refresh' = 'initial') => {
    try {
      if (mode === 'more') setLoadingMore(true);
      else if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await getUsersRequest({ page: pageToLoad, limit: LIMIT });

      setUsers((prev) => {
        const base = pageToLoad === 1 ? [] : prev;
        const { items, hasMore: more } = normalizeList<User>(data, LIMIT, base.length);
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

  useEffect(() => {
    fetchUsers(1, 'initial');
  }, [fetchUsers]);

  function handleLoadMore() {
    if (!loadingMore && hasMore && !loading) {
      fetchUsers(page + 1, 'more');
    }
  }

  const renderItem: ListRenderItem<User> = ({ item }) => {
    const name = item.name ?? item.username ?? 'Usuário';
    const initial = name.charAt(0).toUpperCase();
    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{item.email ?? '—'}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Usuários</Text>
      </View>
      {loading || error || users.length === 0 ? (
        <ListState
          loading={loading}
          error={error}
          empty={!loading && !error && users.length === 0}
          emptyText="Nenhum usuário encontrado."
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, idx) => String(item.id ?? item._id ?? idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchUsers(1, 'refresh')} />
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
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 18 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.muted, marginTop: 2 },
  footer: { textAlign: 'center', color: colors.muted, padding: spacing.md },
});

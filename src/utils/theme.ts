export const colors = {
  primary: '#D32F2F',
  primaryDark: '#B71C1C',
  bg: '#FFFFFF',
  card: '#FFF5F5',
  text: '#1A1A1A',
  muted: '#9E9E9E',
  border: '#FFCDD2',
  danger: '#B71C1C',
  success: '#2E7D32',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, full: 999 } as const;

interface ApiListData {
  users?: unknown[];
  posts?: unknown[];
  data?: unknown[];
  results?: unknown[];
  docs?: unknown[];
  count?: number;
  total?: number;
}

export function normalizeList<T = unknown>(
  data: unknown,
  limit: number,
  loadedSoFar = 0,
): { items: T[]; hasMore: boolean } {
  let items: T[] = [];
  if (Array.isArray(data)) {
    items = data as T[];
  } else {
    const d = data as ApiListData | null | undefined;
    if (Array.isArray(d?.users)) items = d!.users as T[];
    else if (Array.isArray(d?.posts)) items = d!.posts as T[];
    else if (Array.isArray(d?.data)) items = d!.data as T[];
    else if (Array.isArray(d?.results)) items = d!.results as T[];
    else if (Array.isArray(d?.docs)) items = d!.docs as T[];
  }

  const d = data as ApiListData | null | undefined;
  const total = d?.count ?? d?.total ?? null;
  const hasMore =
    typeof total === 'number'
      ? loadedSoFar + items.length < total
      : items.length >= limit;

  return { items, hasMore };
}

export function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string; error?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    err?.message ??
    'Ocorreu um erro inesperado.'
  );
}

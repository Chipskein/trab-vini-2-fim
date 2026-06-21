import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, USER_KEY } from '../api/client';
import { loginRequest, registerRequest } from '../api/services';
import type { User } from '../api/types';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'RESTORE'; token: string | null; user: User | null }
  | { type: 'SIGN_IN'; token: string; user: User | null }
  | { type: 'SIGN_OUT' };

interface AuthContextValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (credentials: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const initialState: AuthState = {
  token: null,
  user: null,
  loading: true,
};

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE':
      return { ...state, token: action.token, user: action.user, loading: false };
    case 'SIGN_IN':
      return { ...state, token: action.token, user: action.user };
    case 'SIGN_OUT':
      return { ...state, token: null, user: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const userStr = await AsyncStorage.getItem(USER_KEY);
        const user: User | null = userStr ? (JSON.parse(userStr) as User) : null;
        dispatch({ type: 'RESTORE', token, user });
      } catch {
        dispatch({ type: 'RESTORE', token: null, user: null });
      }
    })();
  }, []);

  function extractToken(data: unknown): string | null {
    const d = data as { jwt?: string; token?: string; accessToken?: string } | null;
    return d?.jwt ?? d?.token ?? d?.accessToken ?? null;
  }

  function extractUser(data: unknown): User | null {
    const d = data as { user?: User } | null;
    return d?.user ?? null;
  }

  async function signIn({ email, password }: { email: string; password: string }): Promise<void> {
    const data = await loginRequest({ email, password });
    const token = extractToken(data);
    const user = extractUser(data);
    if (!token) throw new Error('Token não retornado pela API.');

    await AsyncStorage.setItem(TOKEN_KEY, token);
    if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    dispatch({ type: 'SIGN_IN', token, user });
  }

  async function signUp({ name, email, password }: { name: string; email: string; password: string }): Promise<void> {
    await registerRequest({ name, email, password });
    await signIn({ email, password });
  }

  async function signOut(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    dispatch({ type: 'SIGN_OUT' });
  }

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        user: state.user,
        loading: state.loading,
        isAuthenticated: !!state.token,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

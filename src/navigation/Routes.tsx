import React from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../utils/theme';
import type { AuthStackParamList, PostsStackParamList, TabParamList } from './types';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UsersScreen from '../screens/UsersScreen';
import PostsScreen from '../screens/PostsScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import MyPostsScreen from '../screens/MyPostsScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const PostsStack = createNativeStackNavigator<PostsStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function AuthRoutes() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function PostsRoutes() {
  return (
    <PostsStack.Navigator>
      <PostsStack.Screen
        name="PostsList"
        component={PostsScreen}
        options={{ headerShown: false }}
      />
      <PostsStack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Criar Post', headerTintColor: colors.primary }}
      />
    </PostsStack.Navigator>
  );
}

function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
      <Text style={styles.logoutText}>Sair</Text>
    </TouchableOpacity>
  );
}

function AccountScreen() {
  const { user } = useAuth();
  return (
    <View style={styles.account}>
      <View style={styles.bigAvatar}>
        <Text style={styles.bigAvatarText}>
          {(user?.name ?? 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.accountName}>{user?.name ?? 'Usuário'}</Text>
      <Text style={styles.accountEmail}>{user?.email ?? ''}</Text>
      <View style={{ height: spacing.xl }} />
      <LogoutButton />
    </View>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { paddingBottom: 6, height: 58 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Posts"
        component={PostsRoutes}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MeusPosts"
        component={MyPostsScreen}
        options={{
          tabBarLabel: 'Meus Posts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Usuarios"
        component={UsersScreen}
        options={{
          tabBarLabel: 'Usuários',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Conta"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Routes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabs /> : <AuthRoutes />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  logoutBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  logoutText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  account: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  bigAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  bigAvatarText: { color: colors.white, fontSize: 40, fontWeight: '800' },
  accountName: { fontSize: 22, fontWeight: '800', color: colors.text },
  accountEmail: { fontSize: 15, color: colors.muted, marginTop: spacing.xs },
});

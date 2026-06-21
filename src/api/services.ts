import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';
import api from './client';
import type { AuthResponse, User, Post, PaginatedUsersResponse, PaginatedPostsResponse } from './types';

export async function registerRequest(params: { name: string; email: string; password: string }): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/users', params);
  return data;
}

export async function loginRequest(params: { email: string; password: string }): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/login', params);
  return data;
}

export async function getUsersRequest(params: { page?: number; limit?: number }): Promise<PaginatedUsersResponse | User[]> {
  const { data } = await api.get<PaginatedUsersResponse | User[]>('/users', { params });
  return data;
}

export async function getPostsRequest(params: { page?: number; limit?: number }): Promise<PaginatedPostsResponse | Post[]> {
  const { data } = await api.get<PaginatedPostsResponse | Post[]>('/posts', { params });
  return data;
}

export async function createPostRequest(params: { title: string; content: string; image: ImagePickerAsset | null }): Promise<unknown> {
  const { title, content, image } = params;
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);

  if (image) {
    const uriParts = image.uri.split('.');
    const fileType = uriParts[uriParts.length - 1] ?? 'jpg';
    const fileName = image.fileName ?? `post.${fileType}`;
    const mimeType = image.mimeType ?? `image/${fileType}`;

    if (Platform.OS === 'web') {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      formData.append('foto', new File([blob], fileName, { type: mimeType }));
    } else {
      formData.append('foto', { uri: image.uri, name: fileName, type: mimeType } as unknown as Blob);
    }
  }

  const { data } = await api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deletePostRequest(id: string | number): Promise<unknown> {
  const { data } = await api.delete(`/posts/${id}`);
  return data;
}

export async function getMyPostsRequest(): Promise<unknown> {
  const { data } = await api.get('/my-posts');
  return data;
}

export interface User {
  id?: string | number;
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
}

export interface Post {
  id?: string | number;
  _id?: string;
  title?: string;
  content?: string;
  createdAt?: string;
  imageId?: string;
  foto?: string;
  fotoUrl?: string;
  photo?: string;
  image?: string;
  imageUrl?: string;
  photoUrl?: string;
  url?: string;
  userId?: string | number;
  authorId?: string | number;
  userName?: string;
  user?: { id?: string | number; _id?: string; name?: string };
  author?: { name?: string };
}

export interface AuthResponse {
  jwt?: string;
  token?: string;
  accessToken?: string;
  user?: User;
}

export interface PaginatedUsersResponse {
  users?: User[];
  count?: number;
  total?: number;
}

export interface PaginatedPostsResponse {
  posts?: Post[];
  count?: number;
  total?: number;
}

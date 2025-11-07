export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  published: number;
  featured: number;
  reading_time: number;
  views: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_id: string;
}

export interface PostWithRelations extends Post {
  author?: User;
  categories?: Category[];
  tags?: Tag[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  published?: boolean;
  featured?: boolean;
  reading_time?: number;
  author_id: string;
  categories?: string[];
  tags?: string[];
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

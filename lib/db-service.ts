import db from './db';
import { Post, PostWithRelations, Category, Tag, User, CreatePostInput, UpdatePostInput } from './types';
import { v4 as uuidv4 } from 'uuid';
import { generateSlug, calculateReadingTime } from './utils';

// User operations
export const userService = {
  create: (email: string, name: string, password: string) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, password)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, email, name, password);
    return userService.findById(id);
  },

  findByEmail: (email: string): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  },

  findById: (id: string): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  },
};

// Post operations
export const postService = {
  create: (input: CreatePostInput): PostWithRelations => {
    const id = uuidv4();
    const readingTime = input.reading_time || calculateReadingTime(input.content);
    const published = input.published ? 1 : 0;
    const featured = input.featured ? 1 : 0;
    const publishedAt = input.published ? new Date().toISOString() : null;

    const stmt = db.prepare(`
      INSERT INTO posts (
        id, title, slug, content, excerpt, cover_image,
        published, featured, reading_time, author_id, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.title,
      input.slug,
      input.content,
      input.excerpt || null,
      input.cover_image || null,
      published,
      featured,
      readingTime,
      input.author_id,
      publishedAt
    );

    // Add categories
    if (input.categories && input.categories.length > 0) {
      const catStmt = db.prepare('INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)');
      for (const categoryId of input.categories) {
        catStmt.run(id, categoryId);
      }
    }

    // Add tags
    if (input.tags && input.tags.length > 0) {
      const tagStmt = db.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)');
      for (const tagId of input.tags) {
        tagStmt.run(id, tagId);
      }
    }

    return postService.findById(id)!;
  },

  update: (input: UpdatePostInput): PostWithRelations | undefined => {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.slug !== undefined) {
      updates.push('slug = ?');
      values.push(input.slug);
    }
    if (input.content !== undefined) {
      updates.push('content = ?');
      values.push(input.content);
      updates.push('reading_time = ?');
      values.push(calculateReadingTime(input.content));
    }
    if (input.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(input.excerpt);
    }
    if (input.cover_image !== undefined) {
      updates.push('cover_image = ?');
      values.push(input.cover_image);
    }
    if (input.published !== undefined) {
      updates.push('published = ?');
      values.push(input.published ? 1 : 0);
      if (input.published) {
        updates.push('published_at = ?');
        values.push(new Date().toISOString());
      }
    }
    if (input.featured !== undefined) {
      updates.push('featured = ?');
      values.push(input.featured ? 1 : 0);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(input.id);

    const stmt = db.prepare(`
      UPDATE posts SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    // Update categories if provided
    if (input.categories !== undefined) {
      db.prepare('DELETE FROM post_categories WHERE post_id = ?').run(input.id);
      if (input.categories.length > 0) {
        const catStmt = db.prepare('INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)');
        for (const categoryId of input.categories) {
          catStmt.run(input.id, categoryId);
        }
      }
    }

    // Update tags if provided
    if (input.tags !== undefined) {
      db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(input.id);
      if (input.tags.length > 0) {
        const tagStmt = db.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)');
        for (const tagId of input.tags) {
          tagStmt.run(input.id, tagId);
        }
      }
    }

    return postService.findById(input.id);
  },

  findById: (id: string): PostWithRelations | undefined => {
    const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
    const post = stmt.get(id) as Post | undefined;

    if (!post) return undefined;

    return {
      ...post,
      categories: categoryService.findByPostId(id),
      tags: tagService.findByPostId(id),
      author: userService.findById(post.author_id),
    };
  },

  findBySlug: (slug: string): PostWithRelations | undefined => {
    const stmt = db.prepare('SELECT * FROM posts WHERE slug = ?');
    const post = stmt.get(slug) as Post | undefined;

    if (!post) return undefined;

    return {
      ...post,
      categories: categoryService.findByPostId(post.id),
      tags: tagService.findByPostId(post.id),
      author: userService.findById(post.author_id),
    };
  },

  findAll: (options?: { published?: boolean; featured?: boolean; limit?: number; offset?: number }): PostWithRelations[] => {
    let query = 'SELECT * FROM posts WHERE 1=1';
    const params: any[] = [];

    if (options?.published !== undefined) {
      query += ' AND published = ?';
      params.push(options.published ? 1 : 0);
    }

    if (options?.featured !== undefined) {
      query += ' AND featured = ?';
      params.push(options.featured ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const stmt = db.prepare(query);
    const posts = stmt.all(...params) as Post[];

    return posts.map(post => ({
      ...post,
      categories: categoryService.findByPostId(post.id),
      tags: tagService.findByPostId(post.id),
      author: userService.findById(post.author_id),
    }));
  },

  search: (query: string): PostWithRelations[] => {
    const stmt = db.prepare(`
      SELECT * FROM posts
      WHERE published = 1 AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)
      ORDER BY created_at DESC
    `);
    const searchTerm = `%${query}%`;
    const posts = stmt.all(searchTerm, searchTerm, searchTerm) as Post[];

    return posts.map(post => ({
      ...post,
      categories: categoryService.findByPostId(post.id),
      tags: tagService.findByPostId(post.id),
      author: userService.findById(post.author_id),
    }));
  },

  delete: (id: string): void => {
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    stmt.run(id);
  },

  incrementViews: (id: string): void => {
    const stmt = db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?');
    stmt.run(id);
  },
};

// Category operations
export const categoryService = {
  create: (name: string, description?: string, color?: string) => {
    const id = uuidv4();
    const slug = generateSlug(name);
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, slug, description, color)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, slug, description || null, color || null);
    return categoryService.findById(id);
  },

  findById: (id: string): Category | undefined => {
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
    return stmt.get(id) as Category | undefined;
  },

  findBySlug: (slug: string): Category | undefined => {
    const stmt = db.prepare('SELECT * FROM categories WHERE slug = ?');
    return stmt.get(slug) as Category | undefined;
  },

  findAll: (): Category[] => {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
    return stmt.all() as Category[];
  },

  findByPostId: (postId: string): Category[] => {
    const stmt = db.prepare(`
      SELECT c.* FROM categories c
      INNER JOIN post_categories pc ON c.id = pc.category_id
      WHERE pc.post_id = ?
    `);
    return stmt.all(postId) as Category[];
  },

  delete: (id: string): void => {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(id);
  },
};

// Tag operations
export const tagService = {
  create: (name: string) => {
    const id = uuidv4();
    const slug = generateSlug(name);
    const stmt = db.prepare(`
      INSERT INTO tags (id, name, slug)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, name, slug);
    return tagService.findById(id);
  },

  findById: (id: string): Tag | undefined => {
    const stmt = db.prepare('SELECT * FROM tags WHERE id = ?');
    return stmt.get(id) as Tag | undefined;
  },

  findBySlug: (slug: string): Tag | undefined => {
    const stmt = db.prepare('SELECT * FROM tags WHERE slug = ?');
    return stmt.get(slug) as Tag | undefined;
  },

  findAll: (): Tag[] => {
    const stmt = db.prepare('SELECT * FROM tags ORDER BY name');
    return stmt.all() as Tag[];
  },

  findByPostId: (postId: string): Tag[] => {
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `);
    return stmt.all(postId) as Tag[];
  },

  delete: (id: string): void => {
    const stmt = db.prepare('DELETE FROM tags WHERE id = ?');
    stmt.run(id);
  },
};

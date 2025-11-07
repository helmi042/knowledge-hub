import { NextRequest, NextResponse } from 'next/server';
import { postService, generateSlug } from '@/lib/db-service';

// GET /api/posts - Get all posts with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let posts;

    if (search) {
      posts = postService.search(search);
    } else {
      posts = postService.findAll({
        published: published === 'true' ? true : published === 'false' ? false : undefined,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, cover_image, published, featured, categories, tags, author_id } = body;

    if (!title || !content || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, author_id' },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);

    const post = postService.create({
      title,
      slug,
      content,
      excerpt,
      cover_image,
      published,
      featured,
      author_id,
      categories,
      tags,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

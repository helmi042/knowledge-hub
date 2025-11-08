import { Metadata } from 'next';
import InlinePostEditor from '@/components/InlinePostEditor';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/posts/${slug}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Knowledge Hub`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.cover_image ? [post.cover_image] : [],
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author?.name || 'Anonymous'],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <InlinePostEditor initialPost={post} />;
}

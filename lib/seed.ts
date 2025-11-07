import db, { initDatabase } from './db';
import { userService, postService, categoryService, tagService, generateSlug } from './db-service';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  // Initialize database schema
  initDatabase();

  console.log('Seeding database...');

  // Check if data already exists
  const existingUser = userService.findByEmail('admin@knowledgehub.com');
  if (existingUser) {
    console.log('Database already seeded. Skipping...');
    console.log('\nLogin credentials:');
    console.log('Email: admin@knowledgehub.com');
    console.log('Password: admin123');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = userService.create('admin@knowledgehub.com', 'Admin User', hashedPassword);
  console.log('Created admin user');

  // Create categories
  const categories = [
    { name: 'Technology', description: 'Tech articles and tutorials', color: '#3B82F6' },
    { name: 'Programming', description: 'Coding tips and best practices', color: '#10B981' },
    { name: 'Design', description: 'UI/UX and design principles', color: '#F59E0B' },
    { name: 'Philosophy', description: 'Thoughts and ideas', color: '#8B5CF6' },
    { name: 'Personal Growth', description: 'Self-improvement and learning', color: '#EC4899' },
  ];

  const createdCategories = categories.map(cat =>
    categoryService.create(cat.name, cat.description, cat.color)
  );
  console.log('Created categories');

  // Create tags
  const tagNames = [
    'JavaScript', 'React', 'TypeScript', 'Next.js', 'Node.js',
    'CSS', 'Tailwind', 'Web Development', 'Tutorial', 'Best Practices',
    'Career', 'Productivity', 'Learning', 'Thoughts'
  ];

  const createdTags = tagNames.map(name => tagService.create(name));
  console.log('Created tags');

  // Create sample posts
  const posts = [
    {
      title: 'Building Modern Web Applications with Next.js',
      content: `# Building Modern Web Applications with Next.js

Next.js has revolutionized the way we build React applications by providing a powerful framework with built-in features like server-side rendering, static site generation, and API routes.

## Why Next.js?

Next.js offers several advantages:

- **Performance**: Automatic code splitting and optimized builds
- **SEO**: Server-side rendering for better search engine visibility
- **Developer Experience**: Fast refresh, TypeScript support, and intuitive routing
- **Flexibility**: Choose between SSR, SSG, or ISR based on your needs

## Getting Started

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Key Features

### 1. File-based Routing
Every file in the \`pages\` directory automatically becomes a route.

### 2. API Routes
Create API endpoints as Node.js functions:

\`\`\`javascript
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello World' });
}
\`\`\`

### 3. Image Optimization
The Image component automatically optimizes images:

\`\`\`jsx
import Image from 'next/image';

<Image src="/photo.jpg" width={500} height={300} alt="Photo" />
\`\`\`

## Conclusion

Next.js is an excellent choice for building modern web applications. Its rich feature set and excellent developer experience make it a top choice for React developers.`,
      excerpt: 'Discover how Next.js transforms React development with powerful features like SSR, SSG, and optimized performance.',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      categories: [createdCategories[0]!.id, createdCategories[1]!.id],
      tags: [createdTags[3]!.id, createdTags[4]!.id, createdTags[7]!.id],
      published: true,
      featured: true,
    },
    {
      title: 'The Art of Writing Clean Code',
      content: `# The Art of Writing Clean Code

Writing clean code is not just about making your code work—it's about making it readable, maintainable, and elegant.

## Principles of Clean Code

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler

### 1. Meaningful Names

Choose names that reveal intent:

\`\`\`javascript
// Bad
const d = new Date();
const x = users.filter(u => u.a);

// Good
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
\`\`\`

### 2. Functions Should Do One Thing

Keep functions small and focused:

\`\`\`javascript
// Bad
function processUserData(user) {
  validateUser(user);
  saveToDatabase(user);
  sendEmail(user);
  updateCache(user);
}

// Good
function processUserData(user) {
  const validUser = validateUser(user);
  saveUser(validUser);
  notifyUser(validUser);
}
\`\`\`

### 3. Don't Repeat Yourself (DRY)

Avoid code duplication by extracting common logic.

### 4. Comments Explain Why, Not What

\`\`\`javascript
// Bad
// Increment i
i++;

// Good
// Skip the first element as it's the header row
i++;
\`\`\`

## Conclusion

Clean code is a craft that takes time to master, but the benefits are immense. Your future self and your team will thank you.`,
      excerpt: 'Learn the essential principles of writing clean, maintainable code that your team will love.',
      coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      categories: [createdCategories[1]!.id],
      tags: [createdTags[0]!.id, createdTags[9]!.id],
      published: true,
      featured: true,
    },
    {
      title: 'Understanding TypeScript Generics',
      content: `# Understanding TypeScript Generics

Generics are one of TypeScript's most powerful features, allowing you to write reusable and type-safe code.

## What Are Generics?

Generics allow you to create components that work with any data type while maintaining type safety.

### Basic Example

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

const result1 = identity<string>("Hello");
const result2 = identity<number>(42);
\`\`\`

## Generic Interfaces

\`\`\`typescript
interface Container<T> {
  value: T;
  getValue: () => T;
  setValue: (value: T) => void;
}

const stringContainer: Container<string> = {
  value: "Hello",
  getValue() { return this.value; },
  setValue(value) { this.value = value; }
};
\`\`\`

## Generic Constraints

\`\`\`typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("Hello"); // ✓
logLength([1, 2, 3]); // ✓
logLength(42); // ✗ Error
\`\`\`

## Real-World Use Cases

1. **API Response Handlers**
2. **Data Structures**
3. **Utility Functions**
4. **React Components**

Generics make your TypeScript code more flexible and type-safe!`,
      excerpt: 'Master TypeScript generics and learn how to write reusable, type-safe code.',
      coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
      categories: [createdCategories[1]!.id],
      tags: [createdTags[2]!.id, createdTags[8]!.id],
      published: true,
      featured: false,
    },
    {
      title: 'The Philosophy of Continuous Learning',
      content: `# The Philosophy of Continuous Learning

In our rapidly evolving world, the ability to learn continuously is not just an advantage—it's a necessity.

## Why Continuous Learning Matters

> "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice." - Brian Herbert

### The Learning Mindset

Adopting a growth mindset means:

1. **Embracing challenges** as opportunities
2. **Persisting** through obstacles
3. **Learning from criticism**
4. **Finding inspiration** in others' success

## Practical Strategies

### 1. Set Learning Goals

Define what you want to learn and why. Make your goals:
- Specific
- Measurable
- Achievable
- Relevant
- Time-bound

### 2. Create a Learning Routine

Consistency is key. Even 30 minutes a day can lead to significant growth over time.

### 3. Learn in Public

Share your learning journey:
- Write blog posts
- Create tutorials
- Engage in discussions
- Teach others

### 4. Embrace Failure

Every mistake is a learning opportunity. Don't fear failure—embrace it as part of the process.

## The Compound Effect

Small, consistent improvements compound over time. What seems insignificant today becomes transformative over months and years.

## Conclusion

Continuous learning is a journey, not a destination. Stay curious, stay humble, and keep growing.`,
      excerpt: 'Explore the mindset and strategies for becoming a lifelong learner in an ever-changing world.',
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      categories: [createdCategories[4]!.id, createdCategories[3]!.id],
      tags: [createdTags[10]!.id, createdTags[11]!.id, createdTags[12]!.id],
      published: true,
      featured: false,
    },
    {
      title: 'Mastering Tailwind CSS',
      content: `# Mastering Tailwind CSS

Tailwind CSS is a utility-first CSS framework that has transformed how we style web applications.

## Why Tailwind?

Traditional CSS frameworks provide pre-built components. Tailwind gives you utility classes to build any design.

### Benefits

- **Rapid Development**: Style elements directly in your markup
- **Consistency**: Use a predefined design system
- **Performance**: Purge unused styles in production
- **Customization**: Easy to customize and extend

## Core Concepts

### Utility Classes

\`\`\`html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
\`\`\`

### Responsive Design

\`\`\`html
<div class="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>
\`\`\`

### Dark Mode

\`\`\`html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Dark mode support
</div>
\`\`\`

## Best Practices

1. **Use @apply for reusable styles**
2. **Customize your theme** in tailwind.config.js
3. **Use arbitrary values** when needed: \`w-[137px]\`
4. **Leverage plugins** for extended functionality

## Conclusion

Tailwind CSS empowers you to build beautiful, responsive designs quickly and efficiently.`,
      excerpt: 'Learn how to leverage Tailwind CSS for rapid and consistent UI development.',
      coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
      categories: [createdCategories[2]!.id, createdCategories[0]!.id],
      tags: [createdTags[5]!.id, createdTags[6]!.id, createdTags[7]!.id],
      published: true,
      featured: false,
    },
  ];

  posts.forEach((post, index) => {
    postService.create({
      title: post.title,
      slug: generateSlug(post.title),
      content: post.content,
      excerpt: post.excerpt,
      cover_image: post.coverImage,
      published: post.published,
      featured: post.featured,
      author_id: admin!.id,
      categories: post.categories,
      tags: post.tags,
    });
    console.log(`Created post: ${post.title}`);
  });

  console.log('Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('Email: admin@knowledgehub.com');
  console.log('Password: admin123');
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

# Knowledge Hub

A beautiful, full-featured personal knowledge management web application built with Next.js, TypeScript, and Tailwind CSS. Share your articles, theories, insights, and tutorials in a clean, elegant format inspired by Medium.com.

## Features

### For Readers
- **Beautiful Reading Experience**: Clean typography and distraction-free layout optimized for reading
- **Search & Filter**: Quickly find articles using search or filter by categories
- **Dark/Light Mode**: Comfortable reading in any lighting condition
- **Rich Content**: Support for Markdown with code highlighting, quotes, images, and more
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile devices
- **Featured Posts**: Highlight your best content
- **SEO Optimized**: OpenGraph meta tags for social sharing

### For Authors
- **Admin Dashboard**: Manage all your posts in one place
- **Markdown Editor**: Write with SimpleMDE editor with live preview
- **Draft System**: Save drafts and publish when ready
- **Categories & Tags**: Organize your content efficiently
- **Featured Posts**: Mark important posts as featured
- **View Counter**: Track how many times each post has been viewed
- **Authentication**: Secure admin area with NextAuth.js

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Authentication**: NextAuth.js
- **Markdown**: SimpleMDE editor, react-markdown with syntax highlighting
- **Typography**: Beautiful prose styling for optimal readability

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd knowledge-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
The `.env` file is already created with default values. For production, update:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secure-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Initialize the database with seed data:
```bash
npm run seed
```

This will create:
- An admin user (email: `admin@knowledgehub.com`, password: `admin123`)
- 5 sample categories
- 14 sample tags
- 5 sample blog posts with rich content

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Accessing the Admin Dashboard

1. Navigate to `/admin` or click "Admin" in the navigation
2. Login with the default credentials:
   - Email: `admin@knowledgehub.com`
   - Password: `admin123`

### Creating a New Post

1. Log in to the admin dashboard
2. Click "Create New Post"
3. Fill in:
   - Title (required)
   - Content in Markdown (required)
   - Excerpt (optional but recommended)
   - Cover Image URL (optional)
   - Select categories and tags
   - Choose to publish immediately or save as draft
   - Mark as featured (optional)
4. Click "Create Post"

### Managing Posts

From the admin dashboard, you can:
- View all posts (published and drafts)
- Edit existing posts
- Delete posts
- Toggle publish/unpublish status
- View post statistics (views, date created)

## Project Structure

```
knowledge-hub/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth configuration
│   │   ├── posts/        # Post CRUD operations
│   │   ├── categories/   # Category management
│   │   └── tags/         # Tag management
│   ├── admin/            # Admin dashboard
│   │   ├── login/        # Login page
│   │   └── posts/        # Post editor
│   ├── posts/[slug]/     # Post detail page
│   ├── about/            # About page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── Header.tsx        # Navigation header
│   ├── PostCard.tsx      # Post preview card
│   ├── PostEditor.tsx    # Markdown editor
│   └── SessionProvider.tsx
├── lib/
│   ├── db.ts             # Database connection
│   ├── db-service.ts     # Database operations
│   ├── types.ts          # TypeScript types
│   └── seed.ts           # Database seeding
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── dev.db            # SQLite database
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with sample data

## Customization

### Changing the Theme

Edit Tailwind classes in components or modify `tailwind.config.js` for global theme changes.

### Adding More Categories

1. Go to the admin dashboard
2. Use the API or directly modify the database
3. Or add them in `lib/seed.ts` and re-run `npm run seed`

### Modifying the Database Schema

1. Update `lib/db.ts` with your schema changes
2. Delete `prisma/dev.db`
3. Run `npm run seed` to recreate the database

## Security Notes

⚠️ **Important for Production:**

1. Change the default admin password after first login
2. Set a strong `NEXTAUTH_SECRET` in `.env`
3. Use environment variables for sensitive data
4. Consider migrating to PostgreSQL for production
5. Implement rate limiting for API routes
6. Add CSRF protection
7. Enable HTTPS

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own knowledge hub!

## Credits

Built with ❤️ using modern web technologies.

Special thanks to:
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS
- The open-source community

## Support

For issues or questions, please open an issue on GitHub.

---

**Happy Writing! 📝**

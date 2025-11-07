export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">About Knowledge Hub</h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            Welcome to Knowledge Hub - a personal digital space designed for documenting, exploring, and sharing ideas, theories, and learnings.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To create an elegant platform where knowledge can be captured, organized, and shared with clarity and purpose.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Features</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
            <li>Beautiful, distraction-free reading experience</li>
            <li>Markdown support for rich content formatting</li>
            <li>Search and filter functionality</li>
            <li>Dark/light mode toggle</li>
            <li>Responsive design for all devices</li>
            <li>Admin dashboard for content management</li>
            <li>SEO optimization for better discoverability</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Technology Stack</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Built with modern web technologies including Next.js, TypeScript, Tailwind CSS, and SQLite.
          </p>

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 text-center">
              Start exploring articles or <a href="/admin/login" className="text-blue-600 dark:text-blue-400 hover:underline">sign in</a> to create your own.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

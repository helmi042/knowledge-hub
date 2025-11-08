'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { PostWithRelations, Category, Tag } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

const lowlight = createLowlight(common);

interface InlinePostEditorProps {
  initialPost: PostWithRelations;
}

export default function InlinePostEditor({ initialPost }: InlinePostEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEditMode, setIsEditMode] = useState(false);
  const [post, setPost] = useState(initialPost);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Edit state
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt || '');
  const [coverImage, setCoverImage] = useState(post.cover_image || '');
  const [showCoverInput, setShowCoverInput] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // TipTap editor for content
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      TiptapImage,
      Placeholder.configure({
        placeholder: 'Start writing your content...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: post.content,
    editable: isEditMode,
    onUpdate: ({ editor }) => {
      if (isEditMode) {
        setHasUnsavedChanges(true);
        debouncedSave();
      }
    },
  });

  // Update editor editable state when edit mode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditMode);
    }
  }, [isEditMode, editor]);

  // Auto-save with debounce
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000); // 2 second debounce
  }, []);

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || !isEditMode) return;

    setIsSaving(true);
    try {
      const userId = (session?.user as any)?.id || post.author_id;

      const postData = {
        title,
        slug: post.slug,
        content: editor?.getHTML() || post.content,
        excerpt,
        cover_image: coverImage,
        published: post.published === 1,
        featured: post.featured === 1,
        categories: post.categories?.map((c) => c.id) || [],
        tags: post.tags?.map((t) => t.id) || [],
        author_id: userId,
      };

      const response = await fetch(`/api/posts/${post.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    await handleAutoSave();
    setIsEditMode(false);
    router.refresh();
  };

  const handleCancel = () => {
    // Reset to original values
    setTitle(post.title);
    setExcerpt(post.excerpt || '');
    setCoverImage(post.cover_image || '');
    editor?.commands.setContent(post.content);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setShowCoverInput(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
    debouncedSave();
  };

  const handleExcerptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExcerpt(e.target.value);
    setHasUnsavedChanges(true);
    debouncedSave();
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverImage(e.target.value);
    setHasUnsavedChanges(true);
    debouncedSave();
  };

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Edit/Save/Cancel Buttons */}
      {session && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-2">
          {isEditMode ? (
            <>
              {/* Save Status */}
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : hasUnsavedChanges ? (
                  'Unsaved changes'
                ) : lastSaved ? (
                  `Saved ${lastSaved.toLocaleTimeString()}`
                ) : (
                  'No changes'
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
                >
                  Save & Exit
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
          )}
        </div>
      )}

      {/* Hero Section - Cover Image */}
      {(coverImage || isEditMode) && (
        <div className="relative h-96 w-full group">
          {coverImage ? (
            <>
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Edit Overlay */}
              {isEditMode && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setShowCoverInput(!showCoverInput)}
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    Change Cover Image
                  </button>
                </div>
              )}
            </>
          ) : isEditMode ? (
            <div className="h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <button
                onClick={() => setShowCoverInput(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Cover Image
              </button>
            </div>
          ) : null}

          {/* Cover Image Input */}
          {isEditMode && showCoverInput && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={handleCoverImageChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  onClick={() => setShowCoverInput(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category: any) => (
                <span
                  key={category.id}
                  className="text-sm font-semibold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: category.color ? `${category.color}20` : '#3B82F620',
                    color: category.color || '#3B82F6',
                  }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title - Inline Editable */}
          {isEditMode ? (
            <textarea
              value={title}
              onChange={handleTitleChange}
              className="w-full text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight bg-transparent border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 focus:outline-none focus:border-blue-500 resize-none overflow-hidden"
              style={{ minHeight: '80px' }}
              placeholder="Post title..."
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {title}
            </h1>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{post.author?.name || 'Anonymous'}</span>
            </div>
            <span>•</span>
            <time dateTime={post.created_at}>{formattedDate}</time>
            <span>•</span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.reading_time} min read
            </span>
            {post.views > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {post.views} views
                </span>
              </>
            )}
          </div>

          {/* Excerpt - Inline Editable */}
          {isEditMode ? (
            <textarea
              value={excerpt}
              onChange={handleExcerptChange}
              className="mt-6 w-full text-xl text-gray-700 dark:text-gray-300 leading-relaxed border-l-4 border-blue-600 pl-6 italic bg-transparent border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 focus:outline-none focus:border-blue-500 resize-none"
              style={{ minHeight: '60px' }}
              placeholder="Brief excerpt or summary..."
            />
          ) : excerpt ? (
            <p className="mt-6 text-xl text-gray-700 dark:text-gray-300 leading-relaxed border-l-4 border-blue-600 pl-6 italic">
              {excerpt}
            </p>
          ) : null}
        </header>

        {/* Article Content - WYSIWYG Editor */}
        {isEditMode ? (
          <div className="tiptap-editor-container">
            {/* Formatting Toolbar */}
            {editor && (
              <div className="mb-4 sticky top-0 z-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 flex flex-wrap gap-1 shadow-lg">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('bold')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <strong>B</strong>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('italic')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <em>I</em>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('code')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Inline Code"
                >
                  {'</>'}
                </button>
                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('heading', { level: 1 })
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('heading', { level: 2 })
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('heading', { level: 3 })
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Heading 3"
                >
                  H3
                </button>
                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('bulletList')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Bullet List"
                >
                  •  List
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('orderedList')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Ordered List"
                >
                  1. List
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('blockquote')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Blockquote"
                >
                  " Quote
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('codeBlock')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Code Block"
                >
                  {'{ } Code'}
                </button>
                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <button
                  onClick={() => {
                    const url = window.prompt('Enter URL:');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    editor.isActive('link')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Add Link"
                >
                  🔗 Link
                </button>
                <button
                  onClick={() => {
                    const url = window.prompt('Enter image URL:');
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Add Image"
                >
                  🖼 Image
                </button>
                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <button
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Horizontal Rule"
                >
                  ─ HR
                </button>
                <button
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  ↷ Redo
                </button>
              </div>
            )}
            <style jsx global>{`
              .tiptap-editor-container .ProseMirror {
                outline: none;
                min-height: 400px;
                padding: 1.5rem;
                border: 2px dashed #d1d5db;
                border-radius: 0.5rem;
                transition: border-color 0.2s;
              }

              .tiptap-editor-container .ProseMirror:focus {
                border-color: #3b82f6;
              }

              .dark .tiptap-editor-container .ProseMirror {
                border-color: #4b5563;
              }

              .dark .tiptap-editor-container .ProseMirror:focus {
                border-color: #3b82f6;
              }

              .tiptap-editor-container .ProseMirror p.is-editor-empty:first-child::before {
                color: #9ca3af;
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
              }

              /* Style the editor content like the prose class */
              .tiptap-editor-container .ProseMirror {
                font-size: 1.125rem;
                line-height: 1.75rem;
              }

              .tiptap-editor-container .ProseMirror h1 {
                font-size: 2.25rem;
                font-weight: bold;
                margin-top: 3rem;
                margin-bottom: 1.5rem;
                color: #111827;
              }

              .dark .tiptap-editor-container .ProseMirror h1 {
                color: #ffffff;
              }

              .tiptap-editor-container .ProseMirror h2 {
                font-size: 1.875rem;
                font-weight: bold;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                color: #111827;
              }

              .dark .tiptap-editor-container .ProseMirror h2 {
                color: #ffffff;
              }

              .tiptap-editor-container .ProseMirror h3 {
                font-size: 1.5rem;
                font-weight: bold;
                margin-top: 2rem;
                margin-bottom: 0.75rem;
                color: #111827;
              }

              .dark .tiptap-editor-container .ProseMirror h3 {
                color: #ffffff;
              }

              .tiptap-editor-container .ProseMirror p {
                margin-bottom: 1.5rem;
                color: #374151;
              }

              .dark .tiptap-editor-container .ProseMirror p {
                color: #d1d5db;
              }

              .tiptap-editor-container .ProseMirror a {
                color: #2563eb;
                text-decoration: none;
              }

              .dark .tiptap-editor-container .ProseMirror a {
                color: #60a5fa;
              }

              .tiptap-editor-container .ProseMirror a:hover {
                text-decoration: underline;
              }

              .tiptap-editor-container .ProseMirror code {
                background-color: #f3f4f6;
                color: #2563eb;
                padding: 0.125rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.875em;
              }

              .dark .tiptap-editor-container .ProseMirror code {
                background-color: #1f2937;
                color: #60a5fa;
              }

              .tiptap-editor-container .ProseMirror pre {
                background-color: #111827;
                color: #f3f4f6;
                padding: 1.5rem;
                border-radius: 0.75rem;
                overflow-x: auto;
                margin-bottom: 1.5rem;
              }

              .dark .tiptap-editor-container .ProseMirror pre {
                background-color: #030712;
              }

              .tiptap-editor-container .ProseMirror pre code {
                background-color: transparent;
                color: inherit;
                padding: 0;
              }

              .tiptap-editor-container .ProseMirror blockquote {
                border-left: 4px solid #2563eb;
                padding-left: 1.5rem;
                font-style: italic;
                color: #374151;
                margin-bottom: 1.5rem;
              }

              .dark .tiptap-editor-container .ProseMirror blockquote {
                color: #d1d5db;
              }

              .tiptap-editor-container .ProseMirror ul,
              .tiptap-editor-container .ProseMirror ol {
                padding-left: 1.5rem;
                margin-bottom: 1.5rem;
              }

              .tiptap-editor-container .ProseMirror ul {
                list-style-type: disc;
              }

              .tiptap-editor-container .ProseMirror ol {
                list-style-type: decimal;
              }

              .tiptap-editor-container .ProseMirror li {
                margin-bottom: 0.5rem;
                color: #374151;
              }

              .dark .tiptap-editor-container .ProseMirror li {
                color: #d1d5db;
              }

              .tiptap-editor-container .ProseMirror img {
                border-radius: 0.75rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                max-width: 100%;
                height: auto;
              }

              .tiptap-editor-container .ProseMirror hr {
                border: none;
                border-top: 1px solid #d1d5db;
                margin: 3rem 0;
              }

              .dark .tiptap-editor-container .ProseMirror hr {
                border-top-color: #374151;
              }

              .tiptap-editor-container .ProseMirror strong {
                font-weight: bold;
                color: #111827;
              }

              .dark .tiptap-editor-container .ProseMirror strong {
                color: #ffffff;
              }

              .tiptap-editor-container .ProseMirror em {
                font-style: italic;
                color: #374151;
              }

              .dark .tiptap-editor-container .ProseMirror em {
                color: #d1d5db;
              }
            `}</style>
            <EditorContent editor={editor} />
          </div>
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
            prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
            prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2
            prose-img:rounded-xl prose-img:shadow-lg
            prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-12
            prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
            prose-em:text-gray-700 dark:prose-em:text-gray-300
          ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

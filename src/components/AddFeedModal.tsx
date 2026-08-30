import React, { useState } from 'react';
import { X, Plus, AlertCircle, CheckCircle2, Loader2, Sparkles, Globe } from 'lucide-react';
import { FeedSource } from '../types';
import { fetchLiveFeed } from '../services/feedService';

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFeed: (newFeed: FeedSource) => void;
  existingCategories: string[];
}

const POPULAR_SUGGESTIONS = [
  {
    title: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com/feed/',
    category: 'Frontend',
  },
  {
    title: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'General Tech',
  },
  {
    title: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    category: 'AI & ML',
  },
  {
    title: 'GitHub Changelog',
    url: 'https://github.blog/changelog/feed/',
    category: 'Backend & DevOps',
  },
];

export const AddFeedModal: React.FC<AddFeedModalProps> = ({
  isOpen,
  onClose,
  onAddFeed,
  existingCategories,
}) => {
  const [feedUrl, setFeedUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(existingCategories[0] || 'Frontend');
  const [customCategory, setCustomCategory] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    title: string;
    description: string;
    itemCount: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleValidateUrl = async (urlToTest?: string) => {
    const url = (urlToTest || feedUrl).trim();
    if (!url) {
      setValidationError('Please enter a feed URL');
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setPreviewData(null);

    try {
      const data = await fetchLiveFeed(url);
      setPreviewData({
        title: data.title || 'Untitled Feed',
        description: data.description || '',
        itemCount: data.items?.length || 0,
      });
      if (!title) {
        setTitle(data.title || '');
      }
    } catch (err: any) {
      setValidationError(
        err.message || 'Unable to fetch or parse this feed. Please verify the URL.'
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedUrl.trim()) return;

    const finalCategory = isCreatingCategory
      ? customCategory.trim() || 'General'
      : category || 'General';

    const finalTitle = title.trim() || previewData?.title || 'New Subscription';

    const newFeed: FeedSource = {
      id: `feed-${Math.random().toString(36).substring(2, 9)}`,
      title: finalTitle,
      feedUrl: feedUrl.trim(),
      siteUrl: feedUrl.trim(),
      description: previewData?.description || '',
      category: finalCategory,
      lastFetched: Date.now(),
    };

    onAddFeed(newFeed);
    onClose();
  };

  return (
    <div
      id="add-feed-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                Add RSS / Atom Feed
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Subscribe to blogs, newsletters, or tech publications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Feed URL */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-primary)] mb-1">
              Feed or Website URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <input
                  type="url"
                  placeholder="https://example.com/rss.xml"
                  value={feedUrl}
                  onChange={(e) => {
                    setFeedUrl(e.target.value);
                    setValidationError(null);
                  }}
                  required
                  className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] pl-9 pr-3 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:bg-[var(--color-bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
              <button
                type="button"
                onClick={() => handleValidateUrl()}
                disabled={isValidating || !feedUrl.trim()}
                className="flex h-9 items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <span>Test Feed</span>
                )}
              </button>
            </div>

            {/* Validation Feedback */}
            {validationError && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {previewData && (
              <div className="mt-2 flex items-center gap-1.5 rounded-md bg-[var(--color-accent-subtle)] p-2 text-xs text-[var(--color-accent)]">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
                <div>
                  <span className="font-semibold">{previewData.title}</span> — Found{' '}
                  {previewData.itemCount} articles
                </div>
              </div>
            )}
          </div>

          {/* Title Override */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-primary)] mb-1">
              Feed Title (Optional)
            </label>
            <input
              type="text"
              placeholder={previewData?.title || 'e.g. My Favorite Tech Blog'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:bg-[var(--color-bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[var(--color-text-primary)]">
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline"
              >
                {isCreatingCategory ? 'Choose existing' : '+ New category'}
              </button>
            </div>

            {isCreatingCategory ? (
              <input
                type="text"
                placeholder="Enter new category name (e.g. Mobile, Crypto, Rust)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                autoFocus
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:bg-[var(--color-bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:bg-[var(--color-bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              >
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="border-t border-[var(--color-border)] pt-3">
            <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
              Quick Suggestions
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {POPULAR_SUGGESTIONS.map((item) => (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => {
                    setFeedUrl(item.url);
                    setTitle(item.title);
                    setCategory(item.category);
                    setIsCreatingCategory(false);
                    handleValidateUrl(item.url);
                  }}
                  className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1.5 text-left text-xs transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)]"
                >
                  <span className="truncate font-medium text-[var(--color-text-primary)]">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!feedUrl.trim()}
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              Subscribe Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

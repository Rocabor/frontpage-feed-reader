import React, { useEffect, useState } from 'react';
import {
  X,
  ExternalLink,
  Bookmark,
  Check,
  Clock,
  Share2,
  Copy,
  CheckCheck,
  Type,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Article } from '../types';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onToggleBookmark: (articleId: string) => void;
  onToggleRead: (articleId: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onToggleBookmark,
  onToggleRead,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(article.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  }[fontFamily];

  const sizeClasses = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-relaxed',
  }[fontSize];

  return (
    <div
      id="article-reader-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-6"
    >
      <div
        className="relative flex h-full max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Reader Top Action Bar */}
        <div className="flex h-13 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 bg-[var(--color-bg-primary)]">
          <div className="flex items-center gap-2 overflow-hidden text-xs text-[var(--color-text-secondary)]">
            <span className="rounded bg-[var(--color-accent-subtle)] px-2 py-0.5 font-semibold text-[var(--color-accent)]">
              {article.category}
            </span>
            <span className="truncate font-medium">{article.feedTitle}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Font Family Controls */}
            <div className="flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-0.5 text-xs">
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-1.5 py-0.5 rounded ${fontFamily === 'sans' ? 'bg-[var(--color-surface)] font-bold text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`}
              >
                Sans
              </button>
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-1.5 py-0.5 rounded font-serif ${fontFamily === 'serif' ? 'bg-[var(--color-surface)] font-bold text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`px-1.5 py-0.5 rounded font-mono ${fontFamily === 'mono' ? 'bg-[var(--color-surface)] font-bold text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`}
              >
                Mono
              </button>
            </div>

            {/* Font Size Controls */}
            <div className="flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-0.5 text-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'sm' ? 'bg-[var(--color-surface)] font-bold text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'base' ? 'bg-[var(--color-surface)] font-bold text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'lg' ? 'bg-[var(--color-surface)] font-bold text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`}
              >
                A+
              </button>
            </div>

            {/* Bookmark */}
            <button
              id="reader-bookmark-btn"
              title="Bookmark article"
              onClick={() => onToggleBookmark(article.id)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-amber-500"
            >
              <Bookmark
                className={`h-4 w-4 ${article.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
              />
            </button>

            {/* Mark as read */}
            <button
              id="reader-mark-read-btn"
              title={article.isRead ? 'Mark unread' : 'Mark read'}
              onClick={() => onToggleRead(article.id)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-success)]"
            >
              <Check className={`h-4 w-4 ${article.isRead ? 'text-[var(--color-success)]' : ''}`} />
            </button>

            {/* Share / Copy link */}
            <button
              id="reader-copy-link-btn"
              title="Copy article link"
              onClick={handleCopyLink}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
            >
              {copied ? <CheckCheck className="h-4 w-4 text-[var(--color-success)]" /> : <Copy className="h-4 w-4" />}
            </button>

            {/* Open Original */}
            <a
              id="reader-open-external-btn"
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              title="Open original website in new tab"
              className="flex h-8 items-center gap-1 rounded-md bg-[var(--color-bg-secondary)] px-2 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
            >
              <span>Visit Site</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            {/* Close */}
            <button
              id="reader-close-btn"
              title="Close reader (Esc)"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Reader Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-12">
          <div className="mx-auto max-w-[45rem]">
            {/* Header Metadata */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
              {article.author && <span>By {article.author}</span>}
              {article.author && <span>•</span>}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readTimeMinutes || 4} min read
              </span>
              <span>•</span>
              <span>{article.pubDate ? new Date(article.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
            </div>

            {/* Article Headline */}
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl leading-tight">
              {article.title}
            </h1>

            {/* Cover Image */}
            {article.coverImage && (
              <div className="my-6 overflow-hidden rounded-xl bg-[var(--color-bg-tertiary)]">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[380px] w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content Display */}
            <div
              className={`prose dark:prose-invert mt-6 max-w-none text-[var(--color-text-primary)] ${fontClasses} ${sizeClasses} space-y-4`}
            >
              {article.content ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: article.content,
                  }}
                  className="reader-html-content space-y-4 leading-relaxed [&_p]:mb-4 [&_a]:text-[var(--color-accent)] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:bg-[var(--color-bg-tertiary)] [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:bg-[var(--color-bg-tertiary)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-base text-[var(--color-text-secondary)]">
                    {article.contentSnippet}
                  </p>
                  <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 text-center">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      This feed provides summaries only. Click below to read the full article on the publisher's site.
                    </p>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                    >
                      <span>Read full article on {article.feedTitle}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Article Footer */}
            <div className="mt-12 border-t border-[var(--color-border)] pt-6 text-center">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
              >
                <span>Read original on {article.feedTitle}</span>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

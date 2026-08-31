import React from 'react';
import {
  Bookmark,
  Check,
  Clock,
  ExternalLink,
  CircleDot,
  CheckCheck,
  ArrowUpDown,
  Sparkles,
  Inbox,
  Filter,
} from 'lucide-react';
import { Article, LayoutMode, FilterView } from '../types';
import { Footer } from './Footer';

interface FeedViewProps {
  articles: Article[];
  layout: LayoutMode;
  currentFilter: FilterView;
  selectedCategory: string | null;
  selectedFeedTitle: string | null;
  searchQuery: string;
  isLoading: boolean;
  onSelectArticle: (article: Article) => void;
  onToggleRead: (articleId: string, e: React.MouseEvent) => void;
  onToggleBookmark: (articleId: string, e: React.MouseEvent) => void;
  onMarkAllAsRead: () => void;
  sortOrder: 'newest' | 'oldest';
  onToggleSortOrder: () => void;
}

const SkeletonCard: React.FC = () => (
  <div className="flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
    <div className="h-40 w-full animate-pulse bg-[var(--color-bg-tertiary)]" />
    <div className="flex flex-1 flex-col p-4">
      <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
      <div className="mt-4 h-3 w-full animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
      <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
      <div className="mt-auto pt-4">
        <div className="h-3 w-28 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
      </div>
    </div>
  </div>
);

export const FeedView: React.FC<FeedViewProps> = ({
  articles,
  layout,
  currentFilter,
  selectedCategory,
  selectedFeedTitle,
  searchQuery,
  isLoading,
  onSelectArticle,
  onToggleRead,
  onToggleBookmark,
  onMarkAllAsRead,
  sortOrder,
  onToggleSortOrder,
}) => {
  // Title for top view bar
  let viewTitle = 'All Articles';
  if (searchQuery) {
    viewTitle = `Search results for "${searchQuery}"`;
  } else if (selectedFeedTitle) {
    viewTitle = selectedFeedTitle;
  } else if (selectedCategory) {
    viewTitle = selectedCategory;
  } else if (currentFilter === 'unread') {
    viewTitle = 'Unread Articles';
  } else if (currentFilter === 'bookmarks') {
    viewTitle = 'Bookmarked Articles';
  }

  const unreadInView = articles.filter((a) => !a.isRead).length;

  return (
    <div id="feed-view-container" className="flex flex-1 flex-col overflow-y-auto">
      {/* Top Banner / Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-6 py-4 bg-[var(--color-bg-primary)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {viewTitle}
          </h1>
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            {unreadInView > 0 && ` • ${unreadInView} unread`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadInView > 0 && (
            <button
              id="mark-all-read-btn"
              onClick={onMarkAllAsRead}
              className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              <CheckCheck className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            id="toggle-sort-order-btn"
            onClick={onToggleSortOrder}
            title={`Sorting by: ${sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}`}
            className="flex h-8 items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline capitalize">{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {isLoading && articles.length === 0 ? (
          /* Loading Skeleton (reserves space to avoid layout shift) */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-secondary)]/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
              No articles found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-[var(--color-text-secondary)]">
              {searchQuery
                ? 'Try tweaking your search keywords or clear the search filter.'
                : currentFilter === 'unread'
                ? "You're all caught up! No unread articles."
                : currentFilter === 'bookmarks'
                ? 'No saved bookmarks yet. Bookmark interesting articles to read them later.'
                : 'No articles in this feed. Try clicking refresh or adding more feeds.'}
            </p>
          </div>
        ) : layout === 'cards' ? (
          /* Card Grid Layout */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                id={`article-card-${article.id}`}
                onClick={() => onSelectArticle(article)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-[var(--color-surface)] shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                  article.isRead
                    ? 'border-[var(--color-border-subtle)] opacity-75'
                    : 'border-[var(--color-border)]'
                }`}
              >
                {/* Cover Image if available */}
                {article.coverImage && (
                  <div className="relative h-40 w-full overflow-hidden bg-[var(--color-bg-tertiary)]">
                    <img
                      src={article.coverImage}
                      alt=""
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={160}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-4">
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="rounded bg-[var(--color-accent-subtle)] px-1.5 py-0.5 font-medium text-[var(--color-accent)]">
                        {article.category}
                      </span>
                      <span className="truncate font-medium text-[var(--color-text-secondary)]">
                        {article.feedTitle}
                      </span>
                    </div>

                    {!article.isRead && (
                      <span className="flex h-2 w-2 rounded-full bg-[var(--color-unread)]" title="Unread" />
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className={`mt-2 text-sm font-semibold leading-snug tracking-tight text-[var(--color-text-primary)] line-clamp-2 ${
                      article.isRead ? 'font-medium text-[var(--color-text-secondary)]' : ''
                    }`}
                  >
                    {article.title}
                  </h3>

                  {/* Snippet */}
                  {article.contentSnippet && (
                    <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)] line-clamp-3">
                      {article.contentSnippet}
                    </p>
                  )}

                  {/* Card Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-3 text-[11px] text-[var(--color-text-tertiary)]">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTimeMinutes || 3} min read
                      </span>
                      <span>•</span>
                      <span>{article.pubDate ? new Date(article.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Toggle Read */}
                      <button
                        title={article.isRead ? 'Mark as unread' : 'Mark as read'}
                        onClick={(e) => onToggleRead(article.id, e)}
                        className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                      >
                        <Check className={`h-3.5 w-3.5 ${article.isRead ? 'text-[var(--color-success)]' : ''}`} />
                      </button>

                      {/* Bookmark */}
                      <button
                        title={article.isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                        onClick={(e) => onToggleBookmark(article.id, e)}
                        className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-amber-500"
                      >
                        <Bookmark
                          className={`h-3.5 w-3.5 ${
                            article.isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : layout === 'compact' ? (
          /* Compact List Layout */
          <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
            {articles.map((article) => (
              <div
                key={article.id}
                id={`article-compact-${article.id}`}
                onClick={() => onSelectArticle(article)}
                className={`group flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--color-bg-tertiary)]/50 ${
                  article.isRead ? 'opacity-70' : 'bg-[var(--color-surface)]'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Unread dot */}
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      article.isRead ? 'bg-transparent' : 'bg-[var(--color-unread)]'
                    }`}
                  />

                  {/* Feed tag */}
                  <span className="hidden w-28 shrink-0 truncate rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-center text-[10px] font-medium text-[var(--color-text-secondary)] sm:inline-block">
                    {article.feedTitle}
                  </span>

                  {/* Title */}
                  <span
                    className={`truncate text-xs text-[var(--color-text-primary)] ${
                      article.isRead ? 'font-normal text-[var(--color-text-secondary)]' : 'font-semibold'
                    }`}
                  >
                    {article.title}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                  <span className="hidden text-[11px] md:inline">
                    {article.pubDate ? new Date(article.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                  </span>

                  {/* Quick actions */}
                  <div className="flex items-center gap-0.5">
                    <button
                      title={article.isRead ? 'Mark as unread' : 'Mark as read'}
                      onClick={(e) => onToggleRead(article.id, e)}
                      className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      <Check className={`h-3 w-3 ${article.isRead ? 'text-[var(--color-success)]' : ''}`} />
                    </button>

                    <button
                      title={article.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                      onClick={(e) => onToggleBookmark(article.id, e)}
                      className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-amber-500"
                    >
                      <Bookmark
                        className={`h-3 w-3 ${
                          article.isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Magazine Layout */
          <div className="mx-auto max-w-4xl space-y-8">
            {articles.map((article, idx) => (
              <article
                key={article.id}
                id={`article-magazine-${article.id}`}
                onClick={() => onSelectArticle(article)}
                className={`group flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs transition-all hover:shadow-md cursor-pointer md:flex-row ${
                  article.isRead ? 'opacity-75' : ''
                }`}
              >
                {/* Image on Magazine View */}
                {article.coverImage ? (
                  <div className="h-48 w-full shrink-0 overflow-hidden rounded-xl bg-[var(--color-bg-tertiary)] md:h-48 md:w-64">
                    <img
                      src={article.coverImage}
                      alt=""
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      width={256}
                      height={192}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                      <span className="font-semibold text-[var(--color-accent)]">
                        {article.feedTitle}
                      </span>
                      <span>•</span>
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{article.pubDate ? new Date(article.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                    </div>

                    <h2
                      className={`mt-2 font-serif text-lg font-bold tracking-tight text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent)] sm:text-xl ${
                        article.isRead ? 'text-[var(--color-text-secondary)] font-normal' : ''
                      }`}
                    >
                      {article.title}
                    </h2>

                    {article.contentSnippet && (
                      <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)] line-clamp-3">
                        {article.contentSnippet}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-3 text-xs text-[var(--color-text-tertiary)]">
                    <div className="flex items-center gap-3">
                      {article.author && (
                        <span>By {article.author}</span>
                      )}
                      <span>{article.readTimeMinutes || 4} min read</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => onToggleRead(article.id, e)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                      >
                        <Check className={`h-3.5 w-3.5 ${article.isRead ? 'text-[var(--color-success)]' : ''}`} />
                        <span>{article.isRead ? 'Read' : 'Mark read'}</span>
                      </button>

                      <button
                        onClick={(e) => onToggleBookmark(article.id, e)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-[var(--color-bg-tertiary)] hover:text-amber-500"
                      >
                        <Bookmark
                          className={`h-3.5 w-3.5 ${
                            article.isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                          }`}
                        />
                        <span>{article.isBookmarked ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

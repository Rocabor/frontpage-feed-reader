import React from 'react';
import { Sparkles, ArrowRight, BookOpen, CheckCheck, Clock, ExternalLink, Bookmark } from 'lucide-react';
import { Article } from '../types';
import { Footer } from './Footer';

interface DigestViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onMarkAllAsRead: () => void;
  onToggleBookmark: (articleId: string, e: React.MouseEvent) => void;
}

export const DigestView: React.FC<DigestViewProps> = ({
  articles,
  onSelectArticle,
  onMarkAllAsRead,
  onToggleBookmark,
}) => {
  // Group unread or top articles by category
  const categories = Array.from(new Set(articles.map((a) => a.category)));
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div id="digest-view" className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 p-6 sm:p-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Digest Hero Header */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Today's Frontpage Briefing</span>
                </div>
                <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
                  The Daily Tech Digest
                </h1>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {today} • Curated top highlights across your {categories.length} subscribed domains
                </p>
              </div>

              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] shadow-xs hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <CheckCheck className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                <span>Mark Digest as Read</span>
              </button>
            </div>
          </div>

          {/* Categories Highlights */}
          <div className="space-y-8">
            {categories.map((category) => {
              const catArticles = articles.filter((a) => a.category === category).slice(0, 3);
              if (catArticles.length === 0) return null;

              return (
                <section key={category} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                    <h2 className="text-sm font-bold tracking-wider text-[var(--color-text-primary)] uppercase">
                      {category}
                    </h2>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {catArticles.length} featured
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {catArticles.map((article) => (
                      <div
                        key={article.id}
                        className="group relative flex flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs transition-all hover:border-[var(--color-accent)] hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)]">
                            <span className="truncate font-semibold text-[var(--color-accent)]">
                              {article.feedTitle}
                            </span>
                            <span>{article.readTimeMinutes || 3}m</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSelectArticle(article)}
                            aria-label={`Open ${article.title}`}
                            className="relative mt-2 cursor-pointer self-start text-left text-xs font-semibold text-[var(--color-text-primary)] line-clamp-2 transition-colors group-hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] after:absolute after:inset-0 after:content-['']"
                          >
                            {article.title}
                          </button>

                          {article.contentSnippet && (
                            <p className="mt-2 text-[11px] text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
                              {article.contentSnippet}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-2 text-[11px] text-[var(--color-text-tertiary)]">
                          <span className="flex items-center gap-1 font-medium text-[var(--color-accent)]">
                            <span>Read</span>
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                          </span>

                          <button
                            onClick={(e) => onToggleBookmark(article.id, e)}
                            className="relative z-10 p-1 hover:text-amber-500"
                          >
                            <Bookmark
                              className={`h-3.5 w-3.5 ${
                                article.isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

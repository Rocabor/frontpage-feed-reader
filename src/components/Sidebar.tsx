import React, { useState } from 'react';
import {
  Inbox,
  CircleDot,
  Bookmark,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Folder,
  Rss,
  RotateCcw,
  AlertCircle,
  X,
  LayoutGrid,
  List,
  BookOpen,
  FileCode,
} from 'lucide-react';
import { FeedSource, FilterView, LayoutMode } from '../types';

interface SidebarProps {
  feeds: FeedSource[];
  categories: string[];
  selectedCategory: string | null;
  selectedFeedId: string | null;
  currentFilter: FilterView;
  unreadCount: number;
  bookmarkCount: number;
  onSelectFilter: (filter: FilterView) => void;
  onSelectCategory: (category: string | null) => void;
  onSelectFeed: (feedId: string | null) => void;
  onOpenAddFeed: () => void;
  onOpenManageFeeds: () => void;
  onResetSampleFeeds: () => void;
  feedUnreadCounts: Record<string, number>;
  categoryUnreadCounts: Record<string, number>;
  onCloseMobile?: () => void;
  layout?: LayoutMode;
  onLayoutChange?: (layout: LayoutMode) => void;
  onOpenOpml?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  feeds,
  categories,
  selectedCategory,
  selectedFeedId,
  currentFilter,
  unreadCount,
  bookmarkCount,
  onSelectFilter,
  onSelectCategory,
  onSelectFeed,
  onOpenAddFeed,
  onOpenManageFeeds,
  onResetSampleFeeds,
  feedUnreadCounts,
  categoryUnreadCounts,
  onCloseMobile,
  layout,
  onLayoutChange,
  onOpenOpml,
}) => {
  // Track open/collapsed state of each category
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  return (
    <aside
      id="app-sidebar"
      className="flex h-full w-full lg:w-[16.25rem] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 lg:bg-[var(--color-bg-secondary)]/50 transition-colors"
    >
      {/* Mobile Drawer Header */}
      {onCloseMobile && (
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white shadow-xs">
              <Rss className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-sm text-[var(--color-text-primary)]">Navigation</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Primary Navigation Views */}
      <div className="p-3">
        <nav className="space-y-1">
          {/* All Feeds */}
          <button
            id="nav-all-feeds"
            onClick={() => {
              onSelectFilter('all');
              onSelectCategory(null);
              onSelectFeed(null);
              onCloseMobile?.();
            }}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentFilter === 'all' && !selectedCategory && !selectedFeedId
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              <span>All Articles</span>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Unread Only */}
          <button
            id="nav-unread-feeds"
            onClick={() => {
              onSelectFilter('unread');
              onSelectCategory(null);
              onSelectFeed(null);
              onCloseMobile?.();
            }}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentFilter === 'unread'
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-[var(--color-unread)]" />
              <span>Unread</span>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Bookmarks */}
          <button
            id="nav-bookmarks"
            onClick={() => {
              onSelectFilter('bookmarks');
              onSelectCategory(null);
              onSelectFeed(null);
              onCloseMobile?.();
            }}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentFilter === 'bookmarks'
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Bookmarks</span>
            </div>
            {bookmarkCount > 0 && (
              <span className="rounded-full bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Daily Digest */}
          <button
            id="nav-daily-digest"
            onClick={() => {
              onSelectFilter('digest');
              onSelectCategory(null);
              onSelectFeed(null);
              onCloseMobile?.();
            }}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentFilter === 'digest'
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Frontpage Digest</span>
            </div>
            <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
              Daily
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile Drawer Layout Mode Switcher & OPML (Visible on mobile/tablet drawer) */}
      {layout && onLayoutChange && (
        <div className="mx-3 my-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)]/70 p-2.5 md:hidden">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Article Layout
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onLayoutChange('cards')}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-xs font-medium transition-colors ${
                layout === 'cards'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => onLayoutChange('compact')}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-xs font-medium transition-colors ${
                layout === 'compact'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <List className="h-3 w-3" />
              <span>List</span>
            </button>
            <button
              onClick={() => onLayoutChange('magazine')}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-xs font-medium transition-colors ${
                layout === 'magazine'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <BookOpen className="h-3 w-3" />
              <span>Mag</span>
            </button>
          </div>

          {onOpenOpml && (
            <button
              onClick={() => {
                onOpenOpml();
                onCloseMobile?.();
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Import / Export OPML</span>
            </button>
          )}
        </div>
      )}

      <div className="mx-3 border-t border-[var(--color-border)]" />

      {/* Categories & Feeds Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--color-text-tertiary)] uppercase">
            Categories & Feeds ({feeds.length})
          </span>
          <button
            id="sidebar-add-feed-btn"
            title="Add Feed"
            onClick={() => {
              onOpenAddFeed();
              onCloseMobile?.();
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-1">
          {categories.map((category) => {
            const catFeeds = feeds.filter((f) => f.category === category);
            const isCatSelected = selectedCategory === category && !selectedFeedId;
            const isCollapsed = !!collapsedCategories[category];
            const catUnread = categoryUnreadCounts[category] || 0;

            return (
              <div key={category} className="space-y-0.5">
                {/* Category Header */}
                <div
                  id={`cat-item-${category.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => {
                    onSelectFilter('all');
                    onSelectCategory(category);
                    onSelectFeed(null);
                    onCloseMobile?.();
                  }}
                  className={`group flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    isCatSelected
                      ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <button
                      onClick={(e) => toggleCategoryCollapse(category, e)}
                      className="p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <Folder className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-secondary)]" />
                    <span className="truncate">{category}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {catUnread > 0 && (
                      <span className="rounded-full bg-[var(--color-border)] px-1.5 py-0.2 text-[10px] font-medium text-[var(--color-text-secondary)]">
                        {catUnread}
                      </span>
                    )}
                  </div>
                </div>

                {/* Feed Items inside Category */}
                {!isCollapsed && (
                  <div className="ml-4 space-y-0.5 border-l border-[var(--color-border-subtle)] pl-2">
                    {catFeeds.map((feed) => {
                      const isFeedSelected = selectedFeedId === feed.id;
                      const feedUnread = feedUnreadCounts[feed.id] || 0;

                      return (
                        <button
                          key={feed.id}
                          id={`feed-item-${feed.id}`}
                          onClick={() => {
                            onSelectFilter('all');
                            onSelectCategory(category);
                            onSelectFeed(feed.id);
                            onCloseMobile?.();
                          }}
                          className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs transition-colors ${
                            isFeedSelected
                              ? 'bg-[var(--color-accent)] text-white font-medium shadow-xs'
                              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {feed.error ? (
                              <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
                            ) : (
                              <Rss className="h-3 w-3 shrink-0 opacity-60" />
                            )}
                            <span className="truncate">{feed.title}</span>
                          </div>

                          {feedUnread > 0 && (
                            <span
                              className={`shrink-0 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                                isFeedSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                              }`}
                            >
                              {feedUnread}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-[var(--color-border)] p-3 space-y-1.5 bg-[var(--color-bg-primary)]/40">
        <button
          id="manage-feeds-sidebar-btn"
          onClick={() => {
            onOpenManageFeeds();
            onCloseMobile?.();
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Manage Feeds</span>
        </button>

        <button
          id="reset-sample-feeds-btn"
          onClick={() => {
            onResetSampleFeeds();
            onCloseMobile?.();
          }}
          title="Reset to the 19 curated sample feeds"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Sample Feeds</span>
        </button>
      </div>
    </aside>
  );
};

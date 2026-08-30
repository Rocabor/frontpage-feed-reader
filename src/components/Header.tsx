import React from 'react';
import {
  Rss,
  Search,
  LayoutGrid,
  List,
  BookOpen,
  Sun,
  Moon,
  Plus,
  FileCode,
  RotateCw,
  Sparkles,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { LayoutMode, FilterView } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  currentFilter: FilterView;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAddFeed: () => void;
  onOpenOpml: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  unreadCount: number;
  onToggleSidebarMobile?: () => void;
  onShowLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  layout,
  onLayoutChange,
  isDark,
  onToggleTheme,
  onOpenAddFeed,
  onOpenOpml,
  onRefreshAll,
  isRefreshing,
  unreadCount,
  onToggleSidebarMobile,
  onShowLanding,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/90 px-4 backdrop-blur-md transition-colors"
    >
      {/* Left: Brand Logo & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebarMobile && (
          <button
            id="mobile-sidebar-toggle"
            onClick={onToggleSidebarMobile}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] lg:hidden"
            aria-label="Toggle Navigation"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        )}

        <div
          id="brand-logo-button"
          onClick={onShowLanding}
          className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white shadow-xs">
            <Rss className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-[var(--color-text-primary)]">
                Frontpage
              </span>
              <span className="rounded-full bg-[var(--color-accent-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                Guest Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="mx-4 max-w-md flex-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            id="search-input"
            type="text"
            placeholder="Search articles, feeds, topics... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] pl-8 pr-7 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] transition-all focus:border-[var(--color-accent)] focus:bg-[var(--color-bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Layout Switcher */}
        <div
          id="layout-switcher"
          className="hidden items-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-0.5 sm:flex"
        >
          <button
            id="layout-btn-cards"
            title="Card Grid View"
            onClick={() => onLayoutChange('cards')}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              layout === 'cards'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            id="layout-btn-compact"
            title="Compact List View"
            onClick={() => onLayoutChange('compact')}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              layout === 'compact'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            id="layout-btn-magazine"
            title="Magazine View"
            onClick={() => onLayoutChange('magazine')}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              layout === 'magazine'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Sync / Refresh Button */}
        <button
          id="refresh-feeds-btn"
          title="Refresh All Feeds"
          onClick={onRefreshAll}
          disabled={isRefreshing}
          className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[var(--color-accent)]' : ''}`} />
          <span className="hidden md:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        {/* OPML Import/Export */}
        <button
          id="opml-manager-btn"
          title="Import / Export OPML"
          onClick={onOpenOpml}
          className="hidden h-8 items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] sm:flex"
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>OPML</span>
        </button>

        {/* Add Feed Button */}
        <button
          id="add-feed-header-btn"
          onClick={onOpenAddFeed}
          className="flex h-8 items-center gap-1 rounded-md bg-[var(--color-accent)] px-3 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add Feed</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          title="Toggle Theme"
          onClick={onToggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5 text-zinc-700" />}
        </button>
      </div>
    </header>
  );
};

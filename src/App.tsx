import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FeedSource, Article, LayoutMode, FilterView } from './types';
import {
  loadSavedFeeds,
  saveFeeds,
  loadBookmarks,
  saveBookmarks,
  loadReadArticles,
  saveReadArticles,
  loadPreferences,
  savePreferences,
  loadCachedArticles,
  saveCachedArticles,
  fetchLiveFeed,
} from './services/feedService';
import { SAMPLE_FEEDS_DATA, INITIAL_CATEGORIES } from './data/guestData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FeedView } from './components/FeedView';
import { ArticleModal } from './components/ArticleModal';
import { AddFeedModal } from './components/AddFeedModal';
import { OpmlModal } from './components/OpmlModal';
import { DigestView } from './components/DigestView';
import { ManageFeedsModal } from './components/ManageFeedsModal';
import { LandingPage } from './components/LandingPage';

export function App() {
  // Navigation & View State
  const [inGuestDashboard, setInGuestDashboard] = useState<boolean>(true);
  const [feeds, setFeeds] = useState<FeedSource[]>(() => loadSavedFeeds());
  const [articles, setArticles] = useState<Article[]>(() => loadCachedArticles());
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());
  const [readArticles, setReadArticles] = useState<string[]>(() => loadReadArticles());
  const [preferences, setPreferences] = useState(() => loadPreferences());

  // Active filters
  const [currentFilter, setCurrentFilter] = useState<FilterView>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modals & Reader
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [isOpmlOpen, setIsOpmlOpen] = useState(false);
  const [isManageFeedsOpen, setIsManageFeedsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Theme Management
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('frontpage_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('frontpage_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('frontpage_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Sync state to localStorage
  useEffect(() => {
    saveFeeds(feeds);
  }, [feeds]);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveReadArticles(readArticles);
  }, [readArticles]);

  useEffect(() => {
    saveCachedArticles(articles);
  }, [articles]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Derive categories from current feeds
  const categories = useMemo(() => {
    const set = new Set<string>();
    INITIAL_CATEGORIES.forEach((c) => set.add(c));
    feeds.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [feeds]);

  // Combine articles with read/bookmark state
  const enrichedArticles = useMemo(() => {
    return articles.map((art) => ({
      ...art,
      isRead: readArticles.includes(art.id),
      isBookmarked: bookmarks.includes(art.id),
    }));
  }, [articles, readArticles, bookmarks]);

  // Calculate unread counts
  const feedUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    enrichedArticles.forEach((a) => {
      if (!a.isRead) {
        counts[a.feedId] = (counts[a.feedId] || 0) + 1;
      }
    });
    return counts;
  }, [enrichedArticles]);

  const categoryUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    enrichedArticles.forEach((a) => {
      if (!a.isRead) {
        counts[a.category] = (counts[a.category] || 0) + 1;
      }
    });
    return counts;
  }, [enrichedArticles]);

  const totalUnreadCount = useMemo(() => {
    return enrichedArticles.filter((a) => !a.isRead).length;
  }, [enrichedArticles]);

  // Filtered articles list
  const displayedArticles = useMemo(() => {
    let list = [...enrichedArticles];

    // Filter view mode
    if (currentFilter === 'unread') {
      list = list.filter((a) => !a.isRead);
    } else if (currentFilter === 'bookmarks') {
      list = list.filter((a) => a.isBookmarked);
    }

    // Category / Feed Filter
    if (selectedFeedId) {
      list = list.filter((a) => a.feedId === selectedFeedId);
    } else if (selectedCategory) {
      list = list.filter((a) => a.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.contentSnippet?.toLowerCase().includes(q) ||
          a.feedTitle.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    // Sort order
    list.sort((a, b) => {
      return sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });

    return list;
  }, [
    enrichedArticles,
    currentFilter,
    selectedCategory,
    selectedFeedId,
    searchQuery,
    sortOrder,
  ]);

  // Fetch live articles for feeds
  const refreshSingleFeed = useCallback(
    async (feedId: string) => {
      const feed = feeds.find((f) => f.id === feedId);
      if (!feed) return;

      try {
        const live = await fetchLiveFeed(feed.feedUrl);
        // Normalize new items
        const newArticles: Article[] = live.items.map((it) => ({
          ...it,
          feedId: feed.id,
          feedTitle: feed.title || live.title,
          category: feed.category,
        }));

        setArticles((prev) => {
          // Merge avoiding duplicates by id/link
          const existingIds = new Set(prev.map((p) => p.id));
          const existingLinks = new Set(prev.map((p) => p.link));
          const toAdd = newArticles.filter(
            (item) => !existingIds.has(item.id) && !existingLinks.has(item.link)
          );
          return [...toAdd, ...prev];
        });

        // Update feed success
        setFeeds((prev) =>
          prev.map((f) => (f.id === feedId ? { ...f, error: null, lastFetched: Date.now() } : f))
        );
      } catch (err: any) {
        console.warn(`Error refreshing feed ${feed.title}:`, err.message);
        setFeeds((prev) =>
          prev.map((f) => (f.id === feedId ? { ...f, error: err.message || 'Failed' } : f))
        );
      }
    },
    [feeds]
  );

  const refreshAllFeeds = useCallback(async () => {
    setIsRefreshing(true);
    // Refresh first 6 feeds concurrently to avoid overwhelming network
    const targets = feeds.slice(0, 8);
    await Promise.allSettled(targets.map((f) => refreshSingleFeed(f.id)));
    setIsRefreshing(false);
  }, [feeds, refreshSingleFeed]);

  // Trigger background refresh on mount
  useEffect(() => {
    // Refresh first 4 feeds on initial mount
    const initialSync = async () => {
      const priorityFeeds = feeds.slice(0, 4);
      for (const feed of priorityFeeds) {
        refreshSingleFeed(feed.id).catch(() => {});
      }
    };
    initialSync();
  }, []);

  // Handlers
  const handleToggleRead = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReadArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const handleToggleBookmark = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const handleMarkAllAsRead = () => {
    const currentIds = displayedArticles.map((a) => a.id);
    setReadArticles((prev) => Array.from(new Set([...prev, ...currentIds])));
  };

  const handleAddFeed = (newFeed: FeedSource) => {
    setFeeds((prev) => [newFeed, ...prev]);
    refreshSingleFeed(newFeed.id);
    setSelectedCategory(newFeed.category);
    setSelectedFeedId(newFeed.id);
    setCurrentFilter('all');
  };

  const handleDeleteFeed = (feedId: string) => {
    setFeeds((prev) => prev.filter((f) => f.id !== feedId));
    if (selectedFeedId === feedId) {
      setSelectedFeedId(null);
    }
  };

  const handleUpdateFeedCategory = (feedId: string, newCategory: string) => {
    setFeeds((prev) =>
      prev.map((f) => (f.id === feedId ? { ...f, category: newCategory } : f))
    );
    setArticles((prev) =>
      prev.map((a) => (a.feedId === feedId ? { ...a, category: newCategory } : a))
    );
  };

  const handleImportFeeds = (newFeeds: FeedSource[]) => {
    setFeeds((prev) => {
      const existingUrls = new Set(prev.map((p) => p.feedUrl));
      const filtered = newFeeds.filter((f) => !existingUrls.has(f.feedUrl));
      return [...filtered, ...prev];
    });
    // Trigger refresh for newly imported feeds
    setTimeout(() => {
      newFeeds.slice(0, 5).forEach((f) => refreshSingleFeed(f.id));
    }, 500);
  };

  const handleResetToSampleFeeds = () => {
    setFeeds(SAMPLE_FEEDS_DATA);
    setSelectedCategory(null);
    setSelectedFeedId(null);
    setCurrentFilter('all');
    refreshAllFeeds();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      } else if (e.key === 'r') {
        refreshAllFeeds();
      } else if (e.key === '1') {
        setPreferences((p) => ({ ...p, layout: 'cards' }));
      } else if (e.key === '2') {
        setPreferences((p) => ({ ...p, layout: 'compact' }));
      } else if (e.key === '3') {
        setPreferences((p) => ({ ...p, layout: 'magazine' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshAllFeeds]);

  // Selected Feed title lookup
  const selectedFeed = feeds.find((f) => f.id === selectedFeedId);

  if (!inGuestDashboard) {
    return (
      <LandingPage
        feedCount={feeds.length}
        onEnterGuestMode={() => setInGuestDashboard(true)}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Top Navigation Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        layout={preferences.layout}
        onLayoutChange={(l) => setPreferences((p) => ({ ...p, layout: l }))}
        currentFilter={currentFilter}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenAddFeed={() => setIsAddFeedOpen(true)}
        onOpenOpml={() => setIsOpmlOpen(true)}
        onRefreshAll={refreshAllFeeds}
        isRefreshing={isRefreshing}
        unreadCount={totalUnreadCount}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onShowLanding={() => setInGuestDashboard(false)}
      />

      {/* Main Workspace Layout: Sidebar + Feed Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            feeds={feeds}
            categories={categories}
            selectedCategory={selectedCategory}
            selectedFeedId={selectedFeedId}
            currentFilter={currentFilter}
            unreadCount={totalUnreadCount}
            bookmarkCount={bookmarks.length}
            onSelectFilter={(f) => {
              setCurrentFilter(f);
              setSelectedCategory(null);
              setSelectedFeedId(null);
            }}
            onSelectCategory={(c) => {
              setSelectedCategory(c);
              setSelectedFeedId(null);
              setCurrentFilter('all');
            }}
            onSelectFeed={(fId) => {
              setSelectedFeedId(fId);
              setCurrentFilter('all');
            }}
            onOpenAddFeed={() => setIsAddFeedOpen(true)}
            onOpenManageFeeds={() => setIsManageFeedsOpen(true)}
            onResetSampleFeeds={handleResetToSampleFeeds}
            feedUnreadCounts={feedUnreadCounts}
            categoryUnreadCounts={categoryUnreadCounts}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileSidebarOpen && (
          <div
            id="mobile-drawer-backdrop"
            className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div
              id="mobile-drawer-content"
              className="h-full w-[18rem] max-w-[85vw] bg-[var(--color-bg-secondary)] shadow-2xl transition-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                feeds={feeds}
                categories={categories}
                selectedCategory={selectedCategory}
                selectedFeedId={selectedFeedId}
                currentFilter={currentFilter}
                unreadCount={totalUnreadCount}
                bookmarkCount={bookmarks.length}
                layout={preferences.layout}
                onLayoutChange={(l) => setPreferences((p) => ({ ...p, layout: l }))}
                onOpenOpml={() => setIsOpmlOpen(true)}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
                onSelectFilter={(f) => {
                  setCurrentFilter(f);
                  setSelectedCategory(null);
                  setSelectedFeedId(null);
                  setIsMobileSidebarOpen(false);
                }}
                onSelectCategory={(c) => {
                  setSelectedCategory(c);
                  setSelectedFeedId(null);
                  setCurrentFilter('all');
                  setIsMobileSidebarOpen(false);
                }}
                onSelectFeed={(fId) => {
                  setSelectedFeedId(fId);
                  setCurrentFilter('all');
                  setIsMobileSidebarOpen(false);
                }}
                onOpenAddFeed={() => {
                  setIsAddFeedOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                onOpenManageFeeds={() => {
                  setIsManageFeedsOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                onResetSampleFeeds={handleResetToSampleFeeds}
                feedUnreadCounts={feedUnreadCounts}
                categoryUnreadCounts={categoryUnreadCounts}
              />
            </div>
          </div>
        )}

        {/* Content Pane: Feed View or Digest View */}
        {currentFilter === 'digest' ? (
          <DigestView
            articles={enrichedArticles}
            onSelectArticle={(art) => {
              setSelectedArticle(art);
              if (!art.isRead) handleToggleRead(art.id);
            }}
            onMarkAllAsRead={handleMarkAllAsRead}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : (
          <FeedView
            articles={displayedArticles}
            layout={preferences.layout}
            currentFilter={currentFilter}
            selectedCategory={selectedCategory}
            selectedFeedTitle={selectedFeed?.title || null}
            searchQuery={searchQuery}
            onSelectArticle={(art) => {
              setSelectedArticle(art);
              if (!art.isRead) handleToggleRead(art.id);
            }}
            onToggleRead={handleToggleRead}
            onToggleBookmark={handleToggleBookmark}
            onMarkAllAsRead={handleMarkAllAsRead}
            sortOrder={sortOrder}
            onToggleSortOrder={() =>
              setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))
            }
          />
        )}
      </div>

      {/* Modals & Overlays */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onToggleBookmark={(id) => handleToggleBookmark(id)}
          onToggleRead={(id) => handleToggleRead(id)}
        />
      )}

      <AddFeedModal
        isOpen={isAddFeedOpen}
        onClose={() => setIsAddFeedOpen(false)}
        onAddFeed={handleAddFeed}
        existingCategories={categories}
      />

      <OpmlModal
        isOpen={isOpmlOpen}
        onClose={() => setIsOpmlOpen(false)}
        feeds={feeds}
        onImportFeeds={handleImportFeeds}
        onResetToSampleFeeds={handleResetToSampleFeeds}
      />

      <ManageFeedsModal
        isOpen={isManageFeedsOpen}
        onClose={() => setIsManageFeedsOpen(false)}
        feeds={feeds}
        categories={categories}
        onDeleteFeed={handleDeleteFeed}
        onUpdateFeedCategory={handleUpdateFeedCategory}
        onRefreshFeed={refreshSingleFeed}
        onRefreshAll={refreshAllFeeds}
      />
    </div>
  );
}

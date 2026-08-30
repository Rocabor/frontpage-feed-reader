export interface Article {
  id: string;
  feedId: string;
  feedTitle: string;
  category: string;
  title: string;
  link: string;
  pubDate: string;
  timestamp: number;
  author?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  coverImage?: string;
  readTimeMinutes?: number;
  isRead?: boolean;
  isBookmarked?: boolean;
  guid?: string;
}

export interface FeedSource {
  id: string;
  title: string;
  feedUrl: string;
  siteUrl: string;
  description?: string;
  category: string;
  format?: 'rss2' | 'atom' | 'json' | string;
  notes?: string;
  lastFetched?: number;
  error?: string | null;
  unreadCount?: number;
  itemCount?: number;
  edgeCase?: string;
}

export interface FeedCategory {
  name: string;
  unreadCount: number;
  feedCount: number;
}

export type LayoutMode = 'cards' | 'compact' | 'magazine';
export type FilterView = 'all' | 'unread' | 'bookmarks' | 'digest' | 'manage';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  layout: LayoutMode;
  autoMarkReadOnScroll: boolean;
  fontSize: 'sm' | 'base' | 'lg';
  sortOrder: 'newest' | 'oldest';
}

export interface OpmlOutline {
  text?: string;
  title?: string;
  type?: string;
  xmlUrl?: string;
  htmlUrl?: string;
  description?: string;
  children?: OpmlOutline[];
}

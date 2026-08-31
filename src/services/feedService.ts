import { FeedSource, Article, OpmlOutline, UserPreferences } from '../types';
import { SAMPLE_FEEDS_DATA, INITIAL_CURATED_ARTICLES } from '../data/guestData';

const FEEDS_STORAGE_KEY = 'frontpage_feeds';
const BOOKMARKS_STORAGE_KEY = 'frontpage_bookmarks';
const READ_ARTICLES_STORAGE_KEY = 'frontpage_read';
const PREFS_STORAGE_KEY = 'frontpage_preferences';
const ARTICLES_CACHE_KEY = 'frontpage_articles_cache';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  layout: 'cards',
  autoMarkReadOnScroll: false,
  fontSize: 'base',
  sortOrder: 'newest',
};

export async function fetchLiveFeed(feedUrl: string): Promise<{
  title: string;
  description: string;
  link: string;
  items: Article[];
}> {
  try {
    const res = await fetch(`/api/feed/fetch?url=${encodeURIComponent(feedUrl)}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    throw err;
  }
}

export function parseOpml(opmlText: string): { categories: Record<string, FeedSource[]>; allFeeds: FeedSource[] } {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(opmlText, 'text/xml');
  const outlines = xmlDoc.querySelectorAll('body > outline, body outline');

  const categories: Record<string, FeedSource[]> = {};
  const allFeeds: FeedSource[] = [];
  const seenUrls = new Set<string>();

  outlines.forEach((outline) => {
    const xmlUrl = outline.getAttribute('xmlUrl') || outline.getAttribute('xmlurl');
    const text = outline.getAttribute('text') || outline.getAttribute('title') || 'Untitled Feed';
    const htmlUrl = outline.getAttribute('htmlUrl') || outline.getAttribute('htmlurl') || '';
    const description = outline.getAttribute('description') || '';
    const type = outline.getAttribute('type') || 'rss';

    if (xmlUrl) {
      if (seenUrls.has(xmlUrl)) return;
      seenUrls.add(xmlUrl);

      // Determine category from parent outline if nested
      let parentCategory = 'General';
      const parentNode = outline.parentElement;
      if (parentNode && parentNode.nodeName.toLowerCase() === 'outline') {
        parentCategory = parentNode.getAttribute('text') || parentNode.getAttribute('title') || 'General';
      }

      const feed: FeedSource = {
        id: `feed-${Math.random().toString(36).substring(2, 9)}`,
        title: text,
        feedUrl: xmlUrl,
        siteUrl: htmlUrl,
        description,
        category: parentCategory,
        format: type,
      };

      if (!categories[parentCategory]) {
        categories[parentCategory] = [];
      }
      categories[parentCategory].push(feed);
      allFeeds.push(feed);
    }
  });

  return { categories, allFeeds };
}

export function generateOpml(feeds: FeedSource[]): string {
  const grouped: Record<string, FeedSource[]> = {};
  feeds.forEach((f) => {
    const cat = f.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(f);
  });

  const bodyOutlines = Object.entries(grouped)
    .map(([cat, catFeeds]) => {
      const items = catFeeds
        .map(
          (feed) =>
            `      <outline type="rss" text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.feedUrl)}" htmlUrl="${escapeXml(feed.siteUrl || '')}" description="${escapeXml(feed.description || '')}" />`
        )
        .join('\n');
      return `    <outline text="${escapeXml(cat)}" title="${escapeXml(cat)}">\n${items}\n    </outline>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Frontpage Subscriptions Export</title>
    <dateCreated>${new Date().toISOString()}</dateCreated>
    <docs>https://opml.org/spec2.opml</docs>
  </head>
  <body>
${bodyOutlines}
  </body>
</opml>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function loadSavedFeeds(): FeedSource[] {
  try {
    const stored = localStorage.getItem(FEEDS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load saved feeds', e);
  }
  return SAMPLE_FEEDS_DATA;
}

export function saveFeeds(feeds: FeedSource[]): void {
  try {
    localStorage.setItem(FEEDS_STORAGE_KEY, JSON.stringify(feeds));
  } catch (e) {
    console.error('Failed to save feeds', e);
  }
}

export function loadBookmarks(): string[] {
  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load bookmarks', e);
  }
  return [];
}

export function saveBookmarks(bookmarks: string[]): void {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmarks', e);
  }
}

export function loadReadArticles(): string[] {
  try {
    const stored = localStorage.getItem(READ_ARTICLES_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load read articles', e);
  }
  return [];
}

export function saveReadArticles(readIds: string[]): void {
  try {
    localStorage.setItem(READ_ARTICLES_STORAGE_KEY, JSON.stringify(readIds));
  } catch (e) {
    console.error('Failed to save read articles', e);
  }
}

export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFS_STORAGE_KEY);
    if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Failed to load preferences', e);
  }
  return DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
}

export function loadCachedArticles(): Article[] {
  try {
    const stored = localStorage.getItem(ARTICLES_CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load cached articles', e);
  }
  return INITIAL_CURATED_ARTICLES;
}

export function saveCachedArticles(articles: Article[]): void {
  try {
    // Keep max 200 cached articles
    localStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(articles.slice(0, 200)));
  } catch (e) {
    console.error('Failed to save articles cache', e);
  }
}

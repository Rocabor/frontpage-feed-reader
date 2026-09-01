// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { generateOpml, parseOpml } from '../services/feedService';
import type { FeedSource } from '../types';

const sampleFeeds: FeedSource[] = [
  {
    id: 'f1',
    title: 'Smashing Magazine',
    feedUrl: 'https://www.smashingmagazine.com/feed/',
    siteUrl: 'https://www.smashingmagazine.com',
    description: 'For professional web designers',
    category: 'Frontend',
    format: 'rss',
    lastFetched: 0,
  },
  {
    id: 'f2',
    title: 'The Verge',
    feedUrl: 'https://www.theverge.com/rss/index.xml',
    siteUrl: 'https://www.theverge.com',
    description: 'Technology news',
    category: 'General Tech',
    format: 'rss',
    lastFetched: 0,
  },
];

describe('generateOpml', () => {
  it('groups feeds by category and emits valid OPML structure', () => {
    const xml = generateOpml(sampleFeeds);
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<opml version="2.0">');
    expect(xml).toContain('<outline text="Frontend"');
    expect(xml).toContain('<outline text="General Tech"');
    expect(xml).toContain('www.smashingmagazine.com/feed/');
    expect(xml).toContain('www.theverge.com/rss/index.xml');
  });

  it('escapes XML special characters in feed data', () => {
    const feeds: FeedSource[] = [
      {
        id: 'f3',
        title: 'A & B <Tech>',
        feedUrl: 'https://example.com/feed?a=1&b=2',
        siteUrl: 'https://example.com',
        description: '',
        category: 'General',
        format: 'rss',
        lastFetched: 0,
      },
    ];
    const xml = generateOpml(feeds);
    expect(xml).toContain('A &amp; B &lt;Tech&gt;');
    expect(xml).toContain('feed?a=1&amp;b=2');
    expect(xml).not.toContain('A & B <Tech>');
  });
});

describe('parseOpml', () => {
  it('parses top-level feed outlines into a flat list', () => {
    const opml = `<?xml version="1.0"?>
    <opml version="2.0">
      <body>
        <outline type="rss" text="Feed One" xmlUrl="https://one.example/feed" />
        <outline type="rss" text="Feed Two" xmlUrl="https://two.example/feed" />
      </body>
    </opml>`;
    const { allFeeds } = parseOpml(opml);
    expect(allFeeds).toHaveLength(2);
    expect(allFeeds[0].feedUrl).toBe('https://one.example/feed');
    expect(allFeeds[0].category).toBe('General');
  });

  it('uses parent outline as category for nested feeds', () => {
    const opml = `<?xml version="1.0"?>
    <opml version="2.0">
      <body>
        <outline text="News">
          <outline type="rss" text="Nested Feed" xmlUrl="https://nested.example/feed" />
        </outline>
      </body>
    </opml>`;
    const { allFeeds } = parseOpml(opml);
    expect(allFeeds).toHaveLength(1);
    expect(allFeeds[0].category).toBe('News');
  });

  it('deduplicates feeds with the same xmlUrl', () => {
    const opml = `<?xml version="1.0"?>
    <opml version="2.0">
      <body>
        <outline type="rss" text="One" xmlUrl="https://dup.example/feed" />
        <outline type="rss" text="Two" xmlUrl="https://dup.example/feed" />
      </body>
    </opml>`;
    const { allFeeds } = parseOpml(opml);
    expect(allFeeds).toHaveLength(1);
  });

  it('returns empty results for feeds without an xmlUrl', () => {
    const opml = `<?xml version="1.0"?>
    <opml version="2.0">
      <body>
        <outline text="Folder only" />
      </body>
    </opml>`;
    const { allFeeds, categories } = parseOpml(opml);
    expect(allFeeds).toHaveLength(0);
    expect(Object.keys(categories)).toHaveLength(0);
  });
});

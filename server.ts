import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import Parser from 'rss-parser';
import { XMLParser } from 'fast-xml-parser';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

interface CustomFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  creator?: string;
  author?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  guid?: string;
  id?: string;
  enclosure?: { url?: string };
  'media:content'?: { $: { url?: string } };
  'media:thumbnail'?: { $: { url?: string } };
}

const parser = new Parser<Record<string, unknown>, CustomFeedItem>({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
  timeout: 10000,
  headers: {
    'User-Agent': 'Frontpage/1.0 (RSS Aggregator; https://frontpage.dev)',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
});

function extractImageFromHtml(html?: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return match ? match[1] : undefined;
}

function stripHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

const purify = createDOMPurify(new JSDOM('').window);

function sanitizeHtml(html?: string): string {
  if (!html) return '';
  // Remove dangerous tags and attributes (script, event handlers, javascript: URIs, etc.)
  return purify.sanitize(html, {
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // API: Get bundled sample feeds JSON
  app.get('/api/sample-feeds', (req, res) => {
    try {
      const samplePath = path.join(process.cwd(), 'data', 'sample-feeds.json');
      if (fs.existsSync(samplePath)) {
        const content = fs.readFileSync(samplePath, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        return res.send(content);
      }
      res.status(404).json({ error: 'Sample feeds file not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Get bundled sample OPML file
  app.get('/api/sample-opml', (req, res) => {
    try {
      const opmlPath = path.join(process.cwd(), 'data', 'sample-feeds.opml');
      if (fs.existsSync(opmlPath)) {
        const content = fs.readFileSync(opmlPath, 'utf-8');
        res.setHeader('Content-Type', 'application/xml');
        return res.send(content);
      }
      res.status(404).json({ error: 'Sample OPML file not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Fetch and parse a single RSS/Atom feed URL
  app.get('/api/feed/fetch', async (req, res) => {
    const feedUrl = req.query.url as string;
    if (!feedUrl) {
      return res.status(400).json({ error: 'Missing "url" query parameter' });
    }

    try {
      // Fetch feed via standard fetch with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(feedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Frontpage-FeedReader/1.0 (RSS Aggregator)',
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Failed to fetch feed from remote server (HTTP ${response.status})`,
        });
      }

      const xmlText = await response.text();
      let parsedFeed;

      try {
        parsedFeed = await parser.parseString(xmlText);
      } catch (parseErr) {
        // Fallback to XMLParser for non-standard XML feeds
        const xmlParser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
        });
        const xmlObj = xmlParser.parse(xmlText);
        
        const channel = xmlObj?.rss?.channel || xmlObj?.feed;
        if (!channel) {
          throw new Error('Invalid RSS/Atom XML structure');
        }

        const itemsRaw = channel.item || channel.entry || [];
        const rawArray = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

        parsedFeed = {
          title: channel.title || 'Untitled Feed',
          description: channel.description || channel.subtitle || '',
          link: channel.link?.['@_href'] || channel.link || '',
          items: rawArray.map((it: any) => ({
            title: it.title || 'Untitled Article',
            link: it.link?.['@_href'] || it.link || '',
            pubDate: it.pubDate || it.updated || it.published || new Date().toISOString(),
            contentSnippet: stripHtml(it.description || it.summary || it.content),
            content: it.content?.['#text'] || it.content || it.description || '',
            creator: it['dc:creator'] || it.author?.name || '',
          })),
        };
      }

      const items = (parsedFeed.items || []).slice(0, 30).map((item: any, index: number) => {
        const rawContent = item.contentEncoded || item.content || item.summary || item.description || '';
        const sanitizedContent = sanitizeHtml(rawContent);
        const snippet = item.contentSnippet || stripHtml(sanitizedContent).slice(0, 300);
        const image =
          item.enclosure?.url ||
          item.mediaContent?.$?.url ||
          item.mediaThumbnail?.$?.url ||
          extractImageFromHtml(rawContent);

        const pubDateStr = item.isoDate || item.pubDate || new Date().toISOString();
        let timestamp = Date.parse(pubDateStr);
        if (isNaN(timestamp)) {
          timestamp = Date.now() - index * 60000;
        }

        return {
          id: item.guid || item.id || item.link || `${feedUrl}-${index}`,
          title: item.title || 'Untitled Post',
          link: item.link || '',
          pubDate: pubDateStr,
          timestamp,
          author: item.creator || item.author || '',
          content: sanitizedContent,
          contentSnippet: snippet,
          coverImage: image,
          readTimeMinutes: Math.max(1, Math.ceil(snippet.split(' ').length / 180)),
        };
      });

      return res.json({
        title: parsedFeed.title || 'Untitled Feed',
        description: parsedFeed.description || '',
        link: parsedFeed.link || '',
        itemCount: items.length,
        items,
      });
    } catch (err: any) {
      console.warn(`[Feed Fetch Error] ${feedUrl}:`, err.message);
      return res.status(502).json({
        error: err.name === 'AbortError' ? 'Feed request timed out' : err.message,
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontpage Feed Reader running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

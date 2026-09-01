import express from 'express';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import net from 'net';
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

export function sanitizeHtml(html?: string): string {
  if (!html) return '';
  // Remove dangerous tags and attributes (script, event handlers, javascript: URIs, etc.)
  return purify.sanitize(html, {
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

// isPrivateAddress: returns true when an IP should never be fetched server-side
// (protects against SSRF toward internal services, cloud metadata, etc.).
export function isPrivateAddress(ip: string): boolean {
  // Normalize IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 -> 127.0.0.1)
  const plain = ip.toLowerCase();
  const ipv4Mapped = plain.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  const addr = ipv4Mapped ? ipv4Mapped[1] : plain;

  if (net.isIP(addr) === 4) {
    const bytes = addr.split('.').map(Number);
    const [a, b] = bytes;
    return (
      a === 0 || // 0.0.0.0/8 current network
      a === 10 || // 10.0.0.0/8 private
      a === 100 || (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 CGNAT
      a === 127 || // 127.0.0.0/8 loopback
      a === 169 && b === 254 || // 169.254.0.0/16 link-local (incl. cloud metadata)
      a === 172 && b >= 16 && b <= 31 || // 172.16.0.0/12 private
      a === 192 && b === 0 || // 192.0.0.0/24 (incl. 192.0.0.9/10, 192.0.0.170/171 IETF)
      a === 192 && b === 168 || // 192.168.0.0/16 private
      a === 192 && b === 0 && bytes[2] === 2 || // 192.0.2.0/24 TEST-NET-1
      a === 198 && (b === 18 || b === 19) || // 198.18.0.0/15 benchmarking
      a === 198 && b === 51 && bytes[2] === 100 || // 198.51.100.0/24 TEST-NET-2
      a === 203 && b === 0 && bytes[2] === 113 || // 203.0.113.0/24 TEST-NET-3
      a >= 224 // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved + broadcast
    );
  }

  if (net.isIP(addr) === 6) {
    const lower = addr.toLowerCase();
    // Strip IPv4-mapped / IPv4-translated suffix already handled above
    return (
      lower === '::' || // unspecified
      lower === '::1' || // IPv6 loopback
      /^fc/i.test(lower) || lower.startsWith('fd') || // fc00::/7 ULA
      /^fe8/i.test(lower) || lower.startsWith('fe9') ||
      lower.startsWith('fea') || lower.startsWith('feb') || // fe80::/10 link-local
      /^ff/i.test(lower) || // ff00::/8 multicast
      lower === '::ffff:0:0' || // IPv4-mapped unspecified
      lower.startsWith('64:ff9b:') || // IPv4-IPv6 translation (NAT64 well-known)
      lower.startsWith('100::') // discard-only /6
    );
  }

  return false;
}

// assertSafeFeedUrl validates that feedUrl can be fetched server-side without
// enabling SSRF. Throws with a user-facing message when the target is unsafe.
export async function assertSafeFeedUrl(feedUrl: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(feedUrl);
  } catch {
    throw new Error('Invalid feed URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https feed URLs are allowed');
  }

  const hostname = parsed.hostname;
  if (!hostname) throw new Error('Invalid feed URL host');

  // Resolve every address the hostname maps to (IPv4 + IPv6) and reject if any
  // is non-public. This prevents DNS rebinding / multi-A-record SSRF.
  const addresses = await dns.promises
    .lookup(hostname, { all: true, verbatim: true })
    .then((result) => result.map((r) => r.address))
    .catch(() => []);

  if (addresses.length === 0) {
    throw new Error('Feed host could not be resolved');
  }

  for (const address of addresses) {
    if (isPrivateAddress(address)) {
      throw new Error('Feed URL points to a non-public address');
    }
  }
}

export function createApp() {
  const app = express();

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

    let safeFeedUrl: string;
    try {
      await assertSafeFeedUrl(feedUrl);
      safeFeedUrl = feedUrl;
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Feed URL rejected' });
    }

    try {
      // Fetch feed via standard fetch with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(safeFeedUrl, {
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

  return app;
}

export function serveFrontend(app: express.Express): void {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export the Express app for Vercel serverless (api/index.ts)
export const app = createApp();

export default app;

